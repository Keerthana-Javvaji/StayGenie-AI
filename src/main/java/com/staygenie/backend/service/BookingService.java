package com.staygenie.backend.service;

import com.staygenie.backend.entity.Booking;
import com.staygenie.backend.entity.Room;
import com.staygenie.backend.repository.BookingRepository;
import com.staygenie.backend.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    public Booking createBooking(Booking booking) {

        if (booking.getCheckInDate() == null || booking.getCheckOutDate() == null) {
            throw new IllegalArgumentException("Check-in and check-out dates are required.");
        }

        if (!booking.getCheckOutDate().isAfter(booking.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date.");
        }

        Long roomId = booking.getRoom().getId();
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with id: " + roomId));

        if (room.getAvailableRooms() <= 0) {
            throw new IllegalStateException("No rooms available for this room type.");
        }

        long nights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        BigDecimal calculatedPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        booking.setTotalPrice(calculatedPrice);
        booking.setRoom(room);
        booking.setStatus("CONFIRMED");

        room.setAvailableRooms(room.getAvailableRooms() - 1);
        roomRepository.save(room);

        return bookingRepository.save(booking);
    }
}