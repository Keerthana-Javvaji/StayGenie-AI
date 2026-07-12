package com.staygenie.backend.service;

import com.staygenie.backend.entity.Booking;
import com.staygenie.backend.entity.Hotel;
import com.staygenie.backend.entity.Room;
import com.staygenie.backend.entity.User;
import com.staygenie.backend.repository.BookingRepository;
import com.staygenie.backend.repository.HotelRepository;
import com.staygenie.backend.repository.RoomRepository;
import com.staygenie.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrchestratorAgent {

    @Autowired
    private GroqService groqService;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingService bookingService;

    public String processUserRequest(String userMessage, Long userId) {
        String intent = detectIntent(userMessage);

        if (intent.equals("CANCEL")) {
            return handleCancelIntent(userMessage, userId);
        } else if (intent.equals("BOOK")) {
            return handleBookingIntent(userMessage, userId);
        } else {
            return handleRecommendationIntent(userMessage);
        }
    }
    
    private String handleCancelIntent(String userMessage, Long userId) {
        // Get user's bookings
        List<Booking> userBookings = bookingRepository.findByUserId(userId);

        if (userBookings.isEmpty()) {
            return "❌ You don't have any bookings to cancel.";
        }

        // Find active bookings only
        List<Booking> activeBookings = userBookings.stream()
                .filter(b -> !b.getStatus().equals("CANCELLED"))
                .collect(Collectors.toList());

        if (activeBookings.isEmpty()) {
            return "❌ You don't have any active bookings to cancel.";
        }

        // Try to find which booking the user wants to cancel
        // Check if they mentioned a booking ID
        String lower = userMessage.toLowerCase();

        // Look for booking number mentioned
        Booking toCancel = null;

        for (Booking b : activeBookings) {
            if (lower.contains("#" + b.getId()) ||
                lower.contains("booking " + b.getId()) ||
                lower.contains("id " + b.getId())) {
                toCancel = b;
                break;
            }
        }

        // If no specific booking mentioned, check hotel name
        if (toCancel == null) {
            for (Booking b : activeBookings) {
                String hotelName = b.getHotel().getName().toLowerCase();
                String[] words = hotelName.split(" ");
                for (String word : words) {
                    if (word.length() > 3 && lower.contains(word)) {
                        toCancel = b;
                        break;
                    }
                }
                if (toCancel != null) break;
            }
        }

        // If still not found, cancel the most recent one
        if (toCancel == null) {
            toCancel = activeBookings.get(activeBookings.size() - 1);
        }

        // Cancel it
        toCancel.setStatus("CANCELLED");
        bookingRepository.save(toCancel);

        return String.format("""
                ✅ **Booking Cancelled Successfully!**
                
                🏨 Hotel: %s
                🛏️ Room: %s
                📅 Check-in: %s
                📅 Check-out: %s
                💰 Amount: ₹%s
                🎫 Booking ID: #%d
                ❌ Status: CANCELLED
                
                Your booking has been cancelled. We hope to see you again soon!
                """,
                toCancel.getHotel().getName(),
                toCancel.getRoom().getRoomType(),
                toCancel.getCheckInDate(),
                toCancel.getCheckOutDate(),
                toCancel.getTotalPrice().toPlainString(),
                toCancel.getId()
        );
    }

    private String detectIntent(String message) {
        String lower = message.toLowerCase();
        if (lower.contains("cancel") || lower.contains("cancellation")) {
            return "CANCEL";
        }
        if (lower.contains("book") || lower.contains("reserve") ||
            lower.contains("confirm") || lower.contains("check in") ||
            lower.contains("checkin") || lower.contains("nights")) {
            return "BOOK";
        }
        return "RECOMMEND";
    }

    private String handleRecommendationIntent(String userMessage) {
        List<Hotel> hotels = hotelRepository.findAll();
        String hotelContext = buildHotelContext(hotels);

        String systemPrompt = """
                You are StayGenie AI, a smart hotel booking assistant.
                You help users find hotels based on their requirements.
                
                Available hotels:
                """ + hotelContext + """
                
                Recommend the most suitable hotel. Be friendly and concise.
                Mention hotel name, price, and why you recommend it.
                Tell them to say "book [hotel name]" to automatically book it.
                """;

        return groqService.chat(systemPrompt, userMessage);
    }

    private String handleBookingIntent(String userMessage, Long userId) {
        List<Hotel> hotels = hotelRepository.findAll();
        String hotelContext = buildHotelContext(hotels);

        // Step 2: Use AI to extract booking details
        String extractionPrompt = """
                Extract booking details from the user message and return ONLY a JSON object.
                Available hotels:
                """ + hotelContext + """
                
                Return ONLY this JSON format, nothing else:
                {
                    "hotelName": "exact hotel name from list or best match",
                    "checkInDate": "YYYY-MM-DD",
                    "checkOutDate": "YYYY-MM-DD",
                    "guests": 1
                }
                
                Rules:
                - If no check-in date mentioned, use tomorrow's date
                - If no nights mentioned, assume 2 nights
                - If no guests mentioned, assume 1
                - Pick the best matching hotel based on city/budget/preferences
                - Today's date is """ + LocalDate.now() + """
                
                Return ONLY the JSON, no explanation.
                """;

        String jsonResponse = groqService.chat(extractionPrompt, userMessage);

        // Step 3: Parse and execute booking
        return executeBooking(jsonResponse, userId, hotels);
    }

    private String executeBooking(String jsonResponse, Long userId, List<Hotel> hotels) {
        try {
            // Clean the JSON response
            String cleaned = jsonResponse.trim();
            if (cleaned.contains("```")) {
                cleaned = cleaned.replaceAll("```json", "").replaceAll("```", "").trim();
            }

            // Parse JSON manually
            String hotelName = extractJson(cleaned, "hotelName");
            String checkInStr = extractJson(cleaned, "checkInDate");
            String checkOutStr = extractJson(cleaned, "checkOutDate");
            String guestsStr = extractJson(cleaned, "guests");

            int guests = 1;
            try { guests = Integer.parseInt(guestsStr); } catch (Exception e) {}

            LocalDate checkIn = LocalDate.parse(checkInStr);
            LocalDate checkOut = LocalDate.parse(checkOutStr);

            // Find matching hotel
            Hotel matchedHotel = hotels.stream()
                    .filter(h -> h.getName().toLowerCase()
                            .contains(hotelName.toLowerCase().substring(0,
                                    Math.min(5, hotelName.length()))))
                    .findFirst()
                    .orElse(hotels.get(0));

            // Find available room
            List<Room> rooms = roomRepository.findByHotelId(matchedHotel.getId());
            if (rooms.isEmpty()) {
                return "❌ Sorry, no rooms are available at " + matchedHotel.getName() + " right now.";
            }

            Room availableRoom = rooms.stream()
                    .filter(r -> r.getAvailableRooms() > 0)
                    .findFirst()
                    .orElse(null);

            if (availableRoom == null) {
                return "❌ Sorry, all rooms at " + matchedHotel.getName() + " are fully booked.";
            }

            // Get user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Create booking
            Booking booking = new Booking();
            booking.setUser(user);
            booking.setHotel(matchedHotel);
            booking.setRoom(availableRoom);
            booking.setCheckInDate(checkIn);
            booking.setCheckOutDate(checkOut);
            booking.setGuests(guests);

            Booking saved = bookingService.createBooking(booking);

            // Return success message
            return String.format("""
                    ✅ **Booking Confirmed Automatically!**
                    
                    🏨 Hotel: %s
                    🛏️ Room: %s
                    📅 Check-in: %s
                    📅 Check-out: %s
                    👥 Guests: %d
                    💰 Total Price: ₹%s
                    🎫 Booking ID: #%d
                    ✨ Status: CONFIRMED
                    
                    Your booking has been successfully created! Have a wonderful stay! 🌟
                    """,
                    matchedHotel.getName(),
                    availableRoom.getRoomType(),
                    saved.getCheckInDate(),
                    saved.getCheckOutDate(),
                    saved.getGuests(),
                    saved.getTotalPrice().toPlainString(),
                    saved.getId()
            );

        } catch (Exception e) {
            return "❌ I couldn't complete the booking automatically. Error: " + e.getMessage() +
                   "\n\nPlease try: \"Book Sunrise Beach Inn for 2 nights from July 10\"";
        }
    }

    private String extractJson(String json, String key) {
        try {
            String search = "\"" + key + "\"";
            int idx = json.indexOf(search);
            if (idx == -1) return "";
            int colon = json.indexOf(":", idx);
            int start = json.indexOf("\"", colon + 1);
            if (start == -1) {
                // might be a number
                String rest = json.substring(colon + 1).trim();
                return rest.replaceAll("[^0-9].*", "").trim();
            }
            int end = json.indexOf("\"", start + 1);
            return json.substring(start + 1, end);
        } catch (Exception e) {
            return "";
        }
    }

    private String buildHotelContext(List<Hotel> hotels) {
        return hotels.stream()
                .map(h -> String.format(
                        "Hotel: %s | City: %s | Price: ₹%s/night | Stars: %s | Description: %s",
                        h.getName(), h.getCity(), h.getPricePerNight(),
                        h.getStarRating(), h.getDescription()
                ))
                .collect(Collectors.joining("\n"));
    }
}