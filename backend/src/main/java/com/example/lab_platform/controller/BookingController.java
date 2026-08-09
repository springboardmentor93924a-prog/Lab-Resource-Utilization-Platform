package com.example.lab_platform.controller;

import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Get all bookings
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'LAB_TECHNICIAN', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // Get booking by ID
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'LAB_TECHNICIAN', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Integer id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create booking
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        return ResponseEntity.ok(bookingService.createBooking(booking));
    }

    // Update booking
    @PreAuthorize("hasAnyRole('STUDENT', 'FACULTY', 'ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable Integer id,
            @RequestBody Booking booking) {

        return ResponseEntity.ok(bookingService.updateBooking(id, booking));
    }

    // Delete booking
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Integer id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    // Approve booking
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'ADMIN')")
    @PutMapping("/{id}/approve")
    public ResponseEntity<Booking> approveBooking(@PathVariable Integer id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    // Reject booking
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'ADMIN')")
    @PutMapping("/{id}/reject")
    public ResponseEntity<Booking> rejectBooking(@PathVariable Integer id) {
        return ResponseEntity.ok(bookingService.rejectBooking(id));
    }

    // Complete booking
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'ADMIN')")
    @PutMapping("/{id}/complete")
    public ResponseEntity<Booking> completeBooking(@PathVariable Integer id) {
        return ResponseEntity.ok(bookingService.completeBooking(id));
    }
}
