
package com.labresource.controller;

import com.labresource.entity.ExternalBooking;
import com.labresource.entity.ExternalBookingStatus;
import com.labresource.service.ExternalBookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/external-bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class ExternalBookingController {

    private final ExternalBookingService service;

    public ExternalBookingController(
            ExternalBookingService service) {

        this.service = service;
    }

    // =========================================================
    // CREATE EXTERNAL BOOKING
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody ExternalBooking booking) {

        try {

            return ResponseEntity.ok(
                    service.createBooking(booking)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    public ResponseEntity<List<ExternalBooking>>
    getAllBookings() {

        return ResponseEntity.ok(
                service.getAllBookings()
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getBooking(
            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    service.getBookingById(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =========================================================
    // GET BY EMAIL
    // =========================================================

    @GetMapping("/email/{email}")
    public ResponseEntity<List<ExternalBooking>>
    getByEmail(
            @PathVariable String email) {

        return ResponseEntity.ok(
                service.getBookingsByEmail(email)
        );
    }

    // =========================================================
    // GET BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ExternalBooking>>
    getByStatus(
            @PathVariable ExternalBookingStatus status) {

        return ResponseEntity.ok(
                service.getBookingsByStatus(status)
        );
    }

    // =========================================================
    // APPROVE
    // =========================================================

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(
            @PathVariable Long id,
            @RequestParam(required = false)
            String remarks) {

        try {

            return ResponseEntity.ok(
                    service.approveBooking(
                            id,
                            remarks
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // REJECT
    // =========================================================

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(
            @PathVariable Long id,
            @RequestParam(required = false)
            String remarks) {

        try {

            return ResponseEntity.ok(
                    service.rejectBooking(
                            id,
                            remarks
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // CANCEL
    // =========================================================

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(
            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    service.cancelBooking(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}
