package com.example.lab_platform.controller;

import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.service.BookingService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // =========================================================
    // GET ALL BOOKINGS
    // =========================================================
    @PreAuthorize("""
        hasAnyRole(
            'STUDENT',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'SYSTEM_ADMIN'
        )
    """)
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {

        return ResponseEntity.ok(
                bookingService.getAllBookings()
        );
    }

    // =========================================================
    // GET BOOKING BY ID
    // =========================================================
    @PreAuthorize("""
        hasAnyRole(
            'STUDENT',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'SYSTEM_ADMIN'
        )
    """)
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(
            @PathVariable Integer id) {

        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================================================
    // CREATE BOOKING
    // (STUDENT only — no other role books equipment for themselves;
    //  managers/dept heads/admins approve or manage bookings instead,
    //  they don't create their own.)
    // =========================================================
    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @RequestBody Booking booking) {

        return ResponseEntity.ok(
                bookingService.createBooking(booking)
        );
    }

    // =========================================================
    // UPDATE BOOKING
    // =========================================================
    @PreAuthorize("""
        hasAnyRole(
            'STUDENT',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'SYSTEM_ADMIN'
        )
    """)
    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable Integer id,
            @RequestBody Booking booking) {

        return ResponseEntity.ok(
                bookingService.updateBooking(id, booking)
        );
    }

    // =========================================================
    // DELETE BOOKING
    // (STUDENT added — cancels their own Pending booking;
    //  enforced in BookingServiceImpl.deleteBooking)
    // =========================================================
    @PreAuthorize("""
        hasAnyRole(
            'STUDENT',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'SYSTEM_ADMIN'
        )
    """)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable Integer id) {

        bookingService.deleteBooking(id);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // APPROVE BOOKING
    // (LAB_MANAGER / DEPARTMENT_HEAD only — the two roles that own
    //  booking approval per the roles doc; no one else decides this.)
    // =========================================================
    @PreAuthorize("""
        hasAnyRole(
            'LAB_MANAGER',
            'DEPARTMENT_HEAD'
        )
    """)
    @PutMapping("/{id}/approve")
    public ResponseEntity<Booking> approveBooking(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                bookingService.approveBooking(id)
        );
    }

    // =========================================================
    // REJECT BOOKING
    // (LAB_MANAGER / DEPARTMENT_HEAD only — same rule as approve,
    //  it's the other half of the same decision.)
    // =========================================================
    @PreAuthorize("""
        hasAnyRole(
            'LAB_MANAGER',
            'DEPARTMENT_HEAD'
        )
    """)
    @PutMapping("/{id}/reject")
    public ResponseEntity<Booking> rejectBooking(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                bookingService.rejectBooking(id)
        );
    }

    // =========================================================
    // COMPLETE BOOKING
    // =========================================================
    @PreAuthorize("""
        hasAnyRole(
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'SYSTEM_ADMIN'
        )
    """)
    @PutMapping("/{id}/complete")
    public ResponseEntity<Booking> completeBooking(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                bookingService.completeBooking(id)
        );
    }
}