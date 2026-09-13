package com.labresource.controller;

import com.labresource.dto.AvailabilityResponse;
import com.labresource.dto.BookingRequest;
import com.labresource.entity.Booking;
import com.labresource.service.BookingService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {
"http://localhost:5173",
"http://localhost:5174",
"http://localhost:5175"
})
public class BookingController {


private final BookingService bookingService;


public BookingController(
        BookingService bookingService
) {

    this.bookingService = bookingService;
}


// =========================================================
// CREATE BOOKING
//
// Any authenticated user can create a booking.
// =========================================================

@PostMapping

@PreAuthorize("""
        hasAnyRole(
            'RESEARCHER',
            'LAB_TECHNICIAN',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

public ResponseEntity<?> createBooking(
        @RequestBody BookingRequest request
) {

    try {

        Booking booking =
                bookingService.createBooking(
                        request
                );

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        booking
                );

    } catch (RuntimeException e) {

        return ResponseEntity
                .badRequest()
                .body(
                        e.getMessage()
                );
    }
}


// =========================================================
// GET ALL BOOKINGS
//
// Management roles only.
// =========================================================

@GetMapping

@PreAuthorize("""
        hasAnyRole(
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

public ResponseEntity<?> getAllBookings() {

    return ResponseEntity.ok(
            bookingService.getAllBookings()
    );
}


// =========================================================
// GET SINGLE BOOKING
// =========================================================

@GetMapping("/{id}")

@PreAuthorize("""
        hasAnyRole(
            'RESEARCHER',
            'LAB_TECHNICIAN',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

public ResponseEntity<?> getBooking(
        @PathVariable Long id
) {

    try {

        return ResponseEntity.ok(
                bookingService.getBooking(
                        id
                )
        );

    } catch (RuntimeException e) {

        return ResponseEntity
                .notFound()
                .build();
    }
}


// =========================================================
// GET USER BOOKINGS
// =========================================================

@GetMapping("/user/{userId}")

@PreAuthorize("""
        hasAnyRole(
            'RESEARCHER',
            'LAB_TECHNICIAN',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

public ResponseEntity<?> getUserBookings(
        @PathVariable Long userId
) {

    return ResponseEntity.ok(
            bookingService.getUserBookings(
                    userId
            )
    );
}


// =========================================================
// GET EQUIPMENT BOOKINGS
// =========================================================

@GetMapping("/equipment/{equipmentId}")

@PreAuthorize("""
        hasAnyRole(
            'RESEARCHER',
            'LAB_TECHNICIAN',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

public ResponseEntity<?> getEquipmentBookings(
        @PathVariable Long equipmentId
) {

    return ResponseEntity.ok(
            bookingService.getEquipmentBookings(
                    equipmentId
            )
    );
}


// =========================================================
// CANCEL BOOKING
// =========================================================

@PutMapping("/{id}/cancel")

@PreAuthorize("""
        hasAnyRole(
            'RESEARCHER',
            'LAB_TECHNICIAN',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

public ResponseEntity<?> cancelBooking(
        @PathVariable Long id
) {

    try {

        return ResponseEntity.ok(
                bookingService.cancelBooking(
                        id
                )
        );

    } catch (RuntimeException e) {

        return ResponseEntity
                .badRequest()
                .body(
                        e.getMessage()
                );
    }
}


// =========================================================
// APPROVE BOOKING
//
// LAB_MANAGER and higher management roles.
// =========================================================

@PutMapping("/{id}/approve")

@PreAuthorize("""
        hasAnyRole(
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

public ResponseEntity<?> approveBooking(
        @PathVariable Long id
) {

    try {

        return ResponseEntity.ok(
                bookingService.approveBooking(
                        id
                )
        );

    } catch (RuntimeException e) {

        return ResponseEntity
                .badRequest()
                .body(
                        e.getMessage()
                );
    }
}


// =========================================================
// REJECT BOOKING
//
// LAB_MANAGER and higher management roles.
// =========================================================

@PutMapping("/{id}/reject")

@PreAuthorize("""
        hasAnyRole(
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

public ResponseEntity<?> rejectBooking(
        @PathVariable Long id
) {

    try {

        return ResponseEntity.ok(
                bookingService.rejectBooking(
                        id
                )
        );

    } catch (RuntimeException e) {

        return ResponseEntity
                .badRequest()
                .body(
                        e.getMessage()
                );
    }
}


// =========================================================
// GET PENDING BOOKINGS
//
// Approval queue.
// =========================================================

@GetMapping("/pending")

@PreAuthorize("""
        hasAnyRole(
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

public ResponseEntity<?> getPendingBookings() {

    return ResponseEntity.ok(
            bookingService.getPendingBookings()
    );
}


// =========================================================
// CHECK AVAILABILITY
// =========================================================

@GetMapping("/availability")

@PreAuthorize("""
        hasAnyRole(
            'RESEARCHER',
            'LAB_TECHNICIAN',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

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
                .body(
                        e.getMessage()
                );
    }
}


// =========================================================
// GET AVAILABLE TIME SLOTS
// =========================================================

@GetMapping("/available-slots")

@PreAuthorize("""
        hasAnyRole(
            'RESEARCHER',
            'LAB_TECHNICIAN',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

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
                .body(
                        e.getMessage()
                );
    }
}


// =========================================================
// GET RECOMMENDED BOOKING SLOT
// =========================================================

@GetMapping("/recommended-slot")

@PreAuthorize("""
        hasAnyRole(
            'RESEARCHER',
            'LAB_TECHNICIAN',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

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
                .body(
                        e.getMessage()
                );
    }
}


}
