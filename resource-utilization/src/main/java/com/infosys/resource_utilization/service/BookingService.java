package com.infosys.resource_utilization.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infosys.resource_utilization.entity.Booking;
import com.infosys.resource_utilization.repository.BookingRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking saveBooking(Booking booking) {
        return bookingRepository.save(booking);
    }
    public Booking getBookingById(Long id) {
    return bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
}

public Booking updateBooking(Long id, Booking booking) {

    Booking existing = getBookingById(id);

    existing.setUser(booking.getUser());
    existing.setEquipment(booking.getEquipment());
    existing.setBookingDate(booking.getBookingDate());
    existing.setStartTime(booking.getStartTime());
    existing.setEndTime(booking.getEndTime());
    existing.setStatus(booking.getStatus());

    return bookingRepository.save(existing);
}

public void deleteBooking(Long id) {
    bookingRepository.deleteById(id);
}
}