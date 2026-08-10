package com.infosys.labresource.booking.controllers;

import com.infosys.labresource.booking.dtos.BookingRequestDTO;
import com.infosys.labresource.booking.dtos.BookingResponseDTO;
import com.infosys.labresource.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD','RESEARCHER')")
    public ResponseEntity<BookingResponseDTO> createBooking(
            @RequestBody BookingRequestDTO requestDTO) {

        BookingResponseDTO booking = bookingService.createBooking(requestDTO);

        return new ResponseEntity<>(booking, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings() {

        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponseDTO> getBookingById(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(bookingService.getBookingById(bookingId));
    }

    @PutMapping("/update/{bookingId}")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD')")
    public ResponseEntity<BookingResponseDTO> updateBooking(
            @PathVariable Long bookingId,
            @RequestBody BookingRequestDTO requestDTO) {

        return ResponseEntity.ok(
                bookingService.updateBooking(bookingId, requestDTO));
    }

    @PutMapping("/approve/{bookingId}")
    @PreAuthorize("hasAnyRole('INSTITUTION_ADMIN','DEPARTMENT_HEAD','LAB_MANAGER')")
    public ResponseEntity<BookingResponseDTO> approveBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {

        return ResponseEntity.ok(
                bookingService.approveBooking(
                        bookingId,
                        authentication.getName()
                )
        );
    }
    @PutMapping("/reject/{bookingId}")
    @PreAuthorize("hasAnyRole('INSTITUTION_ADMIN','DEPARTMENT_HEAD')")
    public ResponseEntity<BookingResponseDTO> rejectBooking(
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(
                bookingService.rejectBooking(bookingId));
    }

    @PutMapping("/cancel/{bookingId}")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD')")
    public ResponseEntity<String> cancelBooking(
            @PathVariable Long bookingId) {

        bookingService.cancelBooking(bookingId);

        return ResponseEntity.ok("Booking cancelled successfully.");
    }

}
