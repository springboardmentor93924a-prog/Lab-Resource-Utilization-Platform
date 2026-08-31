package com.labresource.controller;

import com.labresource.dto.WaitlistRequest;
import com.labresource.dto.WaitlistResponse;
import com.labresource.service.WaitlistService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/waitlists")
@CrossOrigin(origins = "http://localhost:5173")
public class WaitlistController {

    private final WaitlistService waitlistService;

    public WaitlistController(
            WaitlistService waitlistService
    ) {
        this.waitlistService = waitlistService;
    }

    // =========================================================
    // CREATE WAITLIST
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createWaitlist(
            @RequestBody WaitlistRequest request
    ) {

        try {

            WaitlistResponse response =
                    waitlistService.createWaitlist(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // GET ALL WAITLISTS - ADMIN
    // =========================================================

    @GetMapping
    public ResponseEntity<List<WaitlistResponse>>
    getAllWaitlists() {

        return ResponseEntity.ok(
                waitlistService.getAllWaitlists()
        );
    }

    // =========================================================
    // GET WAITING WAITLISTS - ADMIN
    // =========================================================

    @GetMapping("/waiting")
    public ResponseEntity<List<WaitlistResponse>>
    getWaitingWaitlists() {

        return ResponseEntity.ok(
                waitlistService.getWaitingWaitlists()
        );
    }

    // =========================================================
    // GET SINGLE WAITLIST
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getWaitlist(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    waitlistService.getWaitlist(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }

    // =========================================================
    // GET USER WAITLISTS
    // =========================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WaitlistResponse>>
    getUserWaitlists(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                waitlistService.getUserWaitlists(userId)
        );
    }

    // =========================================================
    // GET EQUIPMENT WAITLISTS
    // =========================================================

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<WaitlistResponse>>
    getEquipmentWaitlists(
            @PathVariable Long equipmentId
    ) {

        return ResponseEntity.ok(
                waitlistService.getEquipmentWaitlists(
                        equipmentId
                )
        );
    }

    // =========================================================
    // GET WAITLIST POSITION
    // =========================================================

    @GetMapping("/{id}/position")
    public ResponseEntity<?> getWaitlistPosition(
            @PathVariable Long id
    ) {

        try {

            int position =
                    waitlistService.getWaitlistPosition(id);

            return ResponseEntity.ok(position);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // GET WAITLIST QUEUE
    // =========================================================

    @GetMapping("/queue")
    public ResponseEntity<?> getWaitlistQueue(
            @RequestParam Long equipmentId,
            @RequestParam LocalDate bookingDate,
            @RequestParam LocalTime startTime,
            @RequestParam LocalTime endTime
    ) {

        try {

            List<WaitlistResponse> queue =
                    waitlistService.getWaitlistQueue(
                            equipmentId,
                            bookingDate,
                            startTime,
                            endTime
                    );

            return ResponseEntity.ok(queue);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // CHECK IF USER IS ALREADY ON WAITLIST
    // =========================================================

    @GetMapping("/check")
    public ResponseEntity<?> checkWaitlist(
            @RequestParam Long equipmentId,
            @RequestParam Long userId,
            @RequestParam LocalDate bookingDate,
            @RequestParam LocalTime startTime,
            @RequestParam LocalTime endTime
    ) {

        try {

            boolean alreadyWaiting =
                    waitlistService.isAlreadyOnWaitlist(
                            equipmentId,
                            userId,
                            bookingDate,
                            startTime,
                            endTime
                    );

            return ResponseEntity.ok(alreadyWaiting);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // NOTIFY WAITLIST USER - ADMIN
    // =========================================================

    @PutMapping("/{id}/notify")
    public ResponseEntity<?> notifyWaitlist(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    waitlistService.notifyWaitlist(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // MARK WAITLIST AS BOOKED - ADMIN
    // =========================================================

    @PutMapping("/{id}/book")
    public ResponseEntity<?> markAsBooked(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    waitlistService.markAsBooked(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // CANCEL WAITLIST
    // =========================================================

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelWaitlist(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    waitlistService.cancelWaitlist(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}
