package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.service.BookingService;
import org.springframework.stereotype.Service;
import com.example.lab_platform.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    public BookingServiceImpl(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Override
public Booking createBooking(Booking booking) {

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    User loggedInUser = (User) authentication.getPrincipal();

    String role = loggedInUser.getRole().getRoleName();

    // Student and Faculty bookings belong to the logged-in user
    if (role.equalsIgnoreCase("Student")
            || role.equalsIgnoreCase("Faculty")) {

        booking.setUser(loggedInUser);
    }

    // Default status
    booking.setBookingStatus("Pending");

    return bookingRepository.save(booking);
}

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public Optional<Booking> getBookingById(Integer id) {
        return bookingRepository.findById(id);
    }

    @Override
public Booking updateBooking(Integer id, Booking booking) {

    Booking existingBooking = bookingRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Booking not found with id: " + id));

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    User loggedInUser = (User) authentication.getPrincipal();

    String role = loggedInUser.getRole().getRoleName();

    // Admin can update any booking
    if (!role.equalsIgnoreCase("Admin")) {

        // Only Student and Faculty can update their own booking
        if (!role.equalsIgnoreCase("Student")
                && !role.equalsIgnoreCase("Faculty")) {
            throw new RuntimeException(
                    "You are not allowed to update bookings");
        }

        // User can update only their own booking
        if (!existingBooking.getUser().getUserId()
                .equals(loggedInUser.getUserId())) {
            throw new RuntimeException(
                    "You can only update your own booking");
        }

        // Only Pending bookings can be updated
        if (!"Pending".equalsIgnoreCase(
                existingBooking.getBookingStatus())) {
            throw new RuntimeException(
                    "Only Pending bookings can be updated");
        }
    }

    existingBooking.setUser(booking.getUser());
    existingBooking.setEquipment(booking.getEquipment());
    existingBooking.setBookingDate(booking.getBookingDate());
    existingBooking.setStartTime(booking.getStartTime());
    existingBooking.setEndTime(booking.getEndTime());
    existingBooking.setPurpose(booking.getPurpose());

    // Don't allow normal users to change the approval status
    if (role.equalsIgnoreCase("Admin")
            && booking.getBookingStatus() != null
            && !booking.getBookingStatus().isBlank()) {

        existingBooking.setBookingStatus(
                booking.getBookingStatus());
    }

    return bookingRepository.save(existingBooking);
}

    @Override
    public void deleteBooking(Integer id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Booking not found with id: " + id);
        }

        bookingRepository.deleteById(id);
    }

    @Override
    public Booking approveBooking(Integer id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        booking.setBookingStatus("Confirmed");
        return bookingRepository.save(booking);
    }

    @Override
    public Booking rejectBooking(Integer id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        booking.setBookingStatus("Rejected");

        return bookingRepository.save(booking);
    }
}