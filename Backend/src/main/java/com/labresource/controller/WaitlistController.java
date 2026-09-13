package com.labresource.controller;

import com.labresource.dto.WaitlistRequest;
import com.labresource.dto.WaitlistResponse;
import com.labresource.service.WaitlistService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/waitlists")
@CrossOrigin(origins = {
"http://localhost:5173",
"http://localhost:5174",
"http://localhost:5175"
})
public class WaitlistController {


private final WaitlistService waitlistService;


public WaitlistController(
        WaitlistService waitlistService
) {

    this.waitlistService =
            waitlistService;
}


// =========================================================
// CREATE WAITLIST
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

public ResponseEntity<?> createWaitlist(
        @RequestBody WaitlistRequest request
) {

    try {

        WaitlistResponse response =
                waitlistService.createWaitlist(
                        request
                );

        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        response
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
// GET ALL WAITLISTS
//
// MANAGEMENT ONLY
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

public ResponseEntity<List<WaitlistResponse>>
getAllWaitlists() {

    return ResponseEntity.ok(
            waitlistService.getAllWaitlists()
    );
}


// =========================================================
// GET WAITING WAITLISTS
//
// MANAGEMENT ONLY
// =========================================================

@GetMapping("/waiting")

@PreAuthorize("""
        hasAnyRole(
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

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

public ResponseEntity<?> getWaitlist(
        @PathVariable Long id
) {

    try {

        return ResponseEntity.ok(
                waitlistService.getWaitlist(
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
// GET USER WAITLISTS
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

public ResponseEntity<List<WaitlistResponse>>
getUserWaitlists(
        @PathVariable Long userId
) {

    return ResponseEntity.ok(
            waitlistService.getUserWaitlists(
                    userId
            )
    );
}


// =========================================================
// GET EQUIPMENT WAITLISTS
//
// MANAGEMENT ONLY
// =========================================================

@GetMapping("/equipment/{equipmentId}")

@PreAuthorize("""
        hasAnyRole(
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

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

public ResponseEntity<?> getWaitlistPosition(
        @PathVariable Long id
) {

    try {

        int position =
                waitlistService.getWaitlistPosition(
                        id
                );

        return ResponseEntity.ok(
                position
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
// GET WAITLIST QUEUE
//
// MANAGEMENT ONLY
// =========================================================

@GetMapping("/queue")

@PreAuthorize("""
        hasAnyRole(
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

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

        return ResponseEntity.ok(
                queue
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
// CHECK IF USER IS ALREADY ON WAITLIST
// =========================================================

@GetMapping("/check")

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

        return ResponseEntity.ok(
                alreadyWaiting
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
// NOTIFY WAITLIST USER
//
// MANAGEMENT ONLY
// =========================================================

@PutMapping("/{id}/notify")

@PreAuthorize("""
        hasAnyRole(
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

public ResponseEntity<?> notifyWaitlist(
        @PathVariable Long id
) {

    try {

        return ResponseEntity.ok(
                waitlistService.notifyWaitlist(
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
// MARK WAITLIST AS BOOKED
//
// MANAGEMENT ONLY
// =========================================================

@PutMapping("/{id}/book")

@PreAuthorize("""
        hasAnyRole(
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)

public ResponseEntity<?> markAsBooked(
        @PathVariable Long id
) {

    try {

        return ResponseEntity.ok(
                waitlistService.markAsBooked(
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
// CANCEL WAITLIST
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

public ResponseEntity<?> cancelWaitlist(
        @PathVariable Long id
) {

    try {

        return ResponseEntity.ok(
                waitlistService.cancelWaitlist(
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


}
