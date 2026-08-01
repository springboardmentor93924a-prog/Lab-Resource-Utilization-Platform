package com.example.lab_platform.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public String getAllBookings() {
        return "List of all bookings (For authenticated users)";
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'USER')")
    public String createBooking() {
        return "New booking created successfully";
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteBooking(@PathVariable Long id) {
        return "Booking deleted (Admin only): " + id;
    }
}