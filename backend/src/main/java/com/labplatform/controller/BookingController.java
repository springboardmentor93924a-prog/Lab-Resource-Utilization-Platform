package com.labplatform.controller;

import com.labplatform.dto.Dtos;
import com.labplatform.entity.Booking;
import com.labplatform.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/pending")
    public List<Booking> getPendingBookings() {
        return bookingService.getPendingBookings();
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(Authentication auth, @RequestBody Dtos.BookingRequest req) {
        String email = auth != null ? auth.getName() : "researcher@university.edu";
        return ResponseEntity.ok(bookingService.createBooking(email, req));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Booking> updateStatus(@PathVariable Long id, @RequestBody Dtos.BookingStatusUpdate req) {
        return ResponseEntity.ok(bookingService.updateStatus(id, req.status()));
    }
}