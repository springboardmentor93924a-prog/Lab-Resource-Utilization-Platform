package com.labresource.controller;

import com.labresource.dto.booking.BookingRequest;
import com.labresource.dto.booking.BookingResponse;
import com.labresource.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request
    ) {

        BookingResponse response =
                bookingService.createBooking(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {

        return ResponseEntity.ok(
                bookingService.getAllBookings()
        );
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable String bookingId
    ) {

        return ResponseEntity.ok(
                bookingService.getBookingById(bookingId)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByUser(
            @PathVariable String userId
    ) {

        return ResponseEntity.ok(
                bookingService.getBookingsByUser(userId)
        );
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByEquipment(
            @PathVariable String equipmentId
    ) {

        return ResponseEntity.ok(
                bookingService.getBookingsByEquipment(equipmentId)
        );
    }

    @GetMapping("/status/{bookingStatus}")
    public ResponseEntity<List<BookingResponse>> getBookingsByStatus(
            @PathVariable String bookingStatus
    ) {

        return ResponseEntity.ok(
                bookingService.getBookingsByStatus(bookingStatus)
        );
    }

    @GetMapping("/approval-status/{approvalStatus}")
    public ResponseEntity<List<BookingResponse>>
    getBookingsByApprovalStatus(
            @PathVariable String approvalStatus
    ) {

        return ResponseEntity.ok(
                bookingService.getBookingsByApprovalStatus(
                        approvalStatus
                )
        );
    }

    @PatchMapping("/{bookingId}/approve")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable String bookingId
    ) {

        return ResponseEntity.ok(
                bookingService.approveBooking(bookingId)
        );
    }

    @PatchMapping("/{bookingId}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable String bookingId
    ) {

        return ResponseEntity.ok(
                bookingService.rejectBooking(bookingId)
        );
    }

    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable String bookingId
    ) {

        return ResponseEntity.ok(
                bookingService.cancelBooking(bookingId)
        );
    }

    @PutMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable String bookingId,
            @Valid @RequestBody BookingRequest request
    ) {

        return ResponseEntity.ok(
                bookingService.updateBooking(
                        bookingId,
                        request
                )
        );
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable String bookingId
    ) {

        bookingService.deleteBooking(bookingId);

        return ResponseEntity.noContent().build();
    }
}