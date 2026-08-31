package com.labresource.controller;

import com.labresource.dto.BookingRequest;
import com.labresource.entity.Booking;
import com.labresource.service.BookingService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import com.labresource.dto.AvailabilityResponse;
import com.labresource.dto.BookingOptimizationResponse;
import com.labresource.dto.BookingResponse;
import com.labresource.dto.TimeSlotResponse;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(
            BookingService bookingService
    ) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody BookingRequest request
    ) {

        try {

            Booking booking =
                    bookingService.createBooking(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(booking);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllBookings() {

        return ResponseEntity.ok(
                bookingService.getAllBookings()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBooking(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    bookingService.getBooking(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBookings(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                bookingService.getUserBookings(userId)
        );
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<?> getEquipmentBookings(
            @PathVariable Long equipmentId
    ) {

        return ResponseEntity.ok(
                bookingService.getEquipmentBookings(
                        equipmentId
                )
        );
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    bookingService.cancelBooking(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}/approve")
public ResponseEntity<?> approveBooking(
        @PathVariable Long id
) {

    try {

        return ResponseEntity.ok(
                bookingService.approveBooking(id)
        );

    } catch (RuntimeException e) {

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());
    }
}


@PutMapping("/{id}/reject")
public ResponseEntity<?> rejectBooking(
        @PathVariable Long id
) {

    try {

        return ResponseEntity.ok(
                bookingService.rejectBooking(id)
        );

    } catch (RuntimeException e) {

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());
    }
}

@GetMapping("/pending")
public ResponseEntity<?> getPendingBookings() {

    return ResponseEntity.ok(
            bookingService.getPendingBookings()
    );
}

@GetMapping("/availability")
public ResponseEntity<?> checkAvailability(
        @RequestParam Long equipmentId,
        @RequestParam LocalDate bookingDate,
        @RequestParam LocalTime startTime,
        @RequestParam LocalTime endTime
) {

    try {

        boolean available =
                bookingService.isAvailable(
                        equipmentId,
                        bookingDate,
                        startTime,
                        endTime
                );

        return ResponseEntity.ok(
                new AvailabilityResponse(
                        available,
                        available
                                ? "Equipment is available for the selected time."
                                : "Equipment is already booked for the selected time."
                )
        );

    } catch (RuntimeException e) {

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());
    }
}


@GetMapping("/available-slots")
public ResponseEntity<?> getAvailableTimeSlots(

        @RequestParam Long equipmentId,

        @RequestParam LocalDate bookingDate

) {

    try {

        return ResponseEntity.ok(
                bookingService.getAvailableTimeSlots(
                        equipmentId,
                        bookingDate
                )
        );

    } catch (RuntimeException e) {

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());
    }
}



@GetMapping("/recommended-slot")
public ResponseEntity<?> getRecommendedSlot(
        @RequestParam Long equipmentId,
        @RequestParam LocalDate bookingDate
) {

    try {

        return ResponseEntity.ok(
                bookingService.getRecommendedSlot(
                        equipmentId,
                        bookingDate
                )
        );

    } catch (RuntimeException e) {

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());
    }
}

}