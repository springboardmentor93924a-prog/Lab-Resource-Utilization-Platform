package com.example.lab_platform.service;

import com.example.lab_platform.entity.Booking;

import com.example.lab_platform.dto.RecurringBookingRequest;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface BookingService {

    Booking createBooking(Booking booking);

    List<Booking> getAllBookings();

    Optional<Booking> getBookingById(Integer id);

    Booking updateBooking(Integer id, Booking booking);

    void deleteBooking(Integer id);

    Booking approveBooking(Integer id);

    Booking rejectBooking(Integer id);

    Booking completeBooking(Integer id);

    // Manager marks a started booking as a No Show (the person never came).
    Booking markNoShow(Integer id);

    // Recurring bookings: one request creates a series (DAILY / WEEKLY).
    Map<String, Object> createRecurringBookings(RecurringBookingRequest request);

    // Cancels every still-cancellable future booking of a series.
    Map<String, Object> cancelRecurringSeries(String groupId);

    void autoCompleteOverdueBookings();

    /*
     * Runs the full waitlist cascade for one equipment: every active
     * (WAITING/NOTIFIED) entry, priority ones first then earliest
     * requested time, each attempted for auto-allocation against its
     * own requested window. Called when a booking frees the equipment
     * AND when an equipment-feedback URGENT report gets resolved.
     */
    void processWaitlistForEquipment(Integer equipmentId);
}