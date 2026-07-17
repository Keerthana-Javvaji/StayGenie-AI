package com.staygenie.backend.config;

import com.staygenie.backend.entity.Hotel;
import com.staygenie.backend.entity.Room;
import com.staygenie.backend.repository.HotelRepository;
import com.staygenie.backend.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class HotelDataLoader implements CommandLineRunner {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if no hotels exist
        if (hotelRepository.count() > 0) {
            System.out.println("Hotels already exist, skipping data seeding.");
            return;
        }

        System.out.println("Seeding hotel data...");

        List<Hotel> hotels = List.of(
            createHotel("The Taj Mahal Palace", "Iconic luxury hotel overlooking the Gateway of India", "Mumbai", "Apollo Bunder, Colaba", 18.9220, 72.8332, 25000.00, 5.0),
            createHotel("The Oberoi Mumbai", "Iconic luxury hotel with stunning Arabian Sea views", "Mumbai", "Nariman Point, Mumbai", 18.9256, 72.8242, 35000.00, 5.0),
            createHotel("Taj Lands End", "Luxury beachfront hotel with panoramic Arabian Sea views", "Mumbai", "Bandra West, Mumbai", 19.0544, 72.8147, 28000.00, 5.0),
            createHotel("ITC Grand Central", "Premium business hotel with exceptional dining", "Mumbai", "Parel, Mumbai", 19.0054, 72.8425, 18000.00, 5.0),
            createHotel("The Leela Palace Delhi", "Ultra-luxury hotel inspired by Lutyens Delhi", "Delhi", "Diplomatic Enclave, New Delhi", 28.5986, 77.1724, 42000.00, 5.0),
            createHotel("Taj Mahal Hotel Delhi", "Historic luxury hotel near India Gate", "Delhi", "Mansingh Road, New Delhi", 28.6139, 77.2195, 32000.00, 5.0),
            createHotel("The Claridges Delhi", "Colonial-era luxury hotel in Lutyens Delhi", "Delhi", "Aurangzeb Road, New Delhi", 28.5997, 77.2021, 15000.00, 4.5),
            createHotel("Novotel Delhi Aerocity", "Modern hotel near Indira Gandhi Airport", "Delhi", "Aerocity, New Delhi", 28.5562, 77.0999, 8500.00, 4.0),
            createHotel("The Ritz-Carlton Bangalore", "Ultra-luxury urban retreat in Silicon Valley of India", "Bangalore", "Residency Road, Bangalore", 12.9716, 77.5946, 38000.00, 5.0),
            createHotel("ITC Gardenia Bangalore", "Eco-luxury LEED Platinum certified hotel", "Bangalore", "Residency Road, Bangalore", 12.9698, 77.5982, 22000.00, 5.0),
            createHotel("Lemon Tree Hotel Bangalore", "Vibrant upscale hotel near MG Road", "Bangalore", "MG Road, Bangalore", 12.9762, 77.6033, 6500.00, 4.0),
            createHotel("Lake Pearl Resort", "Cozy lakeside resort with mountain views", "Goa", "Calangute Beach Road", 15.5440, 73.7553, 8500.00, 4.0),
            createHotel("Sunrise Beach Inn", "Budget-friendly stay near the beach with pool and free breakfast", "Goa", "Baga Beach", 15.5553, 73.7517, 4200.00, 3.5),
            createHotel("Taj Exotica Goa", "Luxury beachfront resort with private beach", "Goa", "Benaulim Beach, South Goa", 15.2616, 73.9441, 32000.00, 5.0),
            createHotel("W Goa", "Trendy beachfront resort with vibrant nightlife", "Goa", "Vagator Beach, North Goa", 15.5988, 73.7479, 24000.00, 5.0),
            createHotel("Holiday Inn Goa", "Family-friendly resort near Candolim Beach", "Goa", "Candolim, North Goa", 15.5189, 73.7617, 7500.00, 4.0),
            createHotel("Taj Falaknuma Palace", "Stay in a real palace with royal Nizami hospitality", "Hyderabad", "Engine Bowli, Hyderabad", 17.3316, 78.4602, 45000.00, 5.0),
            createHotel("Novotel Hyderabad", "Modern upscale hotel near HITEC City", "Hyderabad", "HITEC City, Hyderabad", 17.4485, 78.3908, 9000.00, 4.0)
        );

        List<Hotel> savedHotels = hotelRepository.saveAll(hotels);

        for (Hotel hotel : savedHotels) {
            seedRoomsForHotel(hotel);
        }

        System.out.println("Successfully seeded " + savedHotels.size() + " hotels with rooms!");
    }

    private void seedRoomsForHotel(Hotel hotel) {
        String name = hotel.getName();
        BigDecimal basePrice = hotel.getPricePerNight();

        if (name.contains("Ritz") || name.contains("Leela") || name.contains("Falaknuma")) {
            roomRepository.saveAll(List.of(
                createRoom(hotel, "Deluxe Room", basePrice, 2, 20, 15),
                createRoom(hotel, "Grand Suite", basePrice.multiply(BigDecimal.valueOf(1.8)), 4, 8, 5),
                createRoom(hotel, "Royal Suite", basePrice.multiply(BigDecimal.valueOf(2.5)), 4, 3, 2)
            ));
        } else if (name.contains("Taj") || name.contains("Oberoi") || name.contains("ITC")) {
            roomRepository.saveAll(List.of(
                createRoom(hotel, "Superior Room", basePrice, 2, 25, 18),
                createRoom(hotel, "Deluxe Suite", basePrice.multiply(BigDecimal.valueOf(1.6)), 2, 10, 7),
                createRoom(hotel, "Executive Suite", basePrice.multiply(BigDecimal.valueOf(2.2)), 4, 5, 3)
            ));
        } else if (name.contains("W Goa") || name.contains("Exotica")) {
            roomRepository.saveAll(List.of(
                createRoom(hotel, "Beach Room", basePrice, 2, 30, 22),
                createRoom(hotel, "Ocean Suite", basePrice.multiply(BigDecimal.valueOf(1.7)), 4, 10, 6)
            ));
        } else {
            roomRepository.saveAll(List.of(
                createRoom(hotel, "Standard Room", basePrice, 2, 40, 30),
                createRoom(hotel, "Superior Room", basePrice.multiply(BigDecimal.valueOf(1.4)), 2, 20, 15),
                createRoom(hotel, "Family Room", basePrice.multiply(BigDecimal.valueOf(1.8)), 4, 10, 8)
            ));
        }
    }

    private Hotel createHotel(String name, String description, String city,
                               String address, double lat, double lng,
                               double price, double stars) {
        Hotel h = new Hotel();
        h.setName(name);
        h.setDescription(description);
        h.setCity(city);
        h.setAddress(address);
        h.setLatitude(lat);
        h.setLongitude(lng);
        h.setPricePerNight(BigDecimal.valueOf(price));
        h.setStarRating(BigDecimal.valueOf(stars));
        return h;
    }

    private Room createRoom(Hotel hotel, String type, BigDecimal price,
                             int capacity, int total, int available) {
        Room r = new Room();
        r.setHotel(hotel);
        r.setRoomType(type);
        r.setPricePerNight(price);
        r.setCapacity(capacity);
        r.setTotalRooms(total);
        r.setAvailableRooms(available);
        return r;
    }
}