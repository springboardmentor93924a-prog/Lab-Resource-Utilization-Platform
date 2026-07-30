package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Booking;
import com.example.demo.repository.BookingRepository;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping
    public List<Booking> getAll() {
        return bookingRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Booking booking) {
        booking.setStatus("Pending Approval");
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Integer id) {
        if (!bookingRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
        }
        Booking b = bookingRepository.findById(id).get();
        b.setStatus("Confirmed");
        b.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(bookingRepository.save(b));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Integer id) {
        if (!bookingRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
        }
        Booking b = bookingRepository.findById(id).get();
        b.setStatus("Cancelled");
        b.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(bookingRepository.save(b));
    }
}