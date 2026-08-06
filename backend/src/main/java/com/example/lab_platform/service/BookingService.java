package com.example.lab_platform.service;

import com.example.lab_platform.entity.Booking;

import java.util.List;
import java.util.Optional;

public interface BookingService {

    Booking createBooking(Booking booking);

    List<Booking> getAllBookings();

    Optional<Booking> getBookingById(Integer id);

    Booking updateBooking(Integer id, Booking booking);

    void deleteBooking(Integer id);

    Booking approveBooking(Integer id);

    Booking rejectBooking(Integer id);
}