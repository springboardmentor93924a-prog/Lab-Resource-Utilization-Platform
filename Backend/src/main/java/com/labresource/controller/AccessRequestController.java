
package com.labresource.controller;

import com.labresource.entity.AccessRequest;
import com.labresource.service.AccessRequestService;

import com.labresource.dto.AccessRequestDTO;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/access-requests")
@CrossOrigin(origins = "http://localhost:5173")
public class AccessRequestController {

    private final AccessRequestService accessRequestService;

    public AccessRequestController(
            AccessRequestService accessRequestService
    ) {
        this.accessRequestService = accessRequestService;
    }

    // =========================================================
    // CREATE ACCESS REQUEST
    // =========================================================
    //
    // Example:
    // POST /api/access-requests?userId=2&sharedEquipmentId=1
    //      &requestReason=Need equipment for research
    //
    // =========================================================

    @PostMapping
public ResponseEntity<?> createRequest(
        @RequestBody AccessRequestDTO requestDTO
) {

    try {

        if (requestDTO.getUserId() == null) {
            return ResponseEntity
                    .badRequest()
                    .body("userId is required");
        }

        if (requestDTO.getSharedEquipmentId() == null) {
            return ResponseEntity
                    .badRequest()
                    .body("sharedEquipmentId is required");
        }

        AccessRequest request =
                accessRequestService.createRequest(
                        requestDTO.getUserId(),
                        requestDTO.getSharedEquipmentId(),
                        requestDTO.getRequestReason()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(request);

    } catch (RuntimeException e) {

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());
    }
}


    // =========================================================
    // GET ALL ACCESS REQUESTS
    // =========================================================
    //
    // GET /api/access-requests
    //
    // Used by Admin / Lab Manager
    //
    // =========================================================

    @GetMapping
    public ResponseEntity<List<AccessRequest>>
    getAllRequests() {

        return ResponseEntity.ok(
                accessRequestService.getAllRequests()
        );
    }


    // =========================================================
    // GET ACCESS REQUEST BY ID
    // =========================================================
    //
    // GET /api/access-requests/1
    //
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getRequestById(
            @PathVariable Long id
    ) {

        try {

            return ResponseEntity.ok(
                    accessRequestService
                            .getRequestById(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }


    // =========================================================
    // GET REQUESTS BY USER
    // =========================================================
    //
    // GET /api/access-requests/user/2
    //
    // Used by researcher to see My Access Requests
    //
    // =========================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getRequestsByUser(
            @PathVariable Long userId
    ) {

        try {

            return ResponseEntity.ok(
                    accessRequestService
                            .getRequestsByUser(userId)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // GET PENDING REQUESTS
    // =========================================================
    //
    // GET /api/access-requests/pending
    //
    // Used by Admin / Lab Manager
    //
    // =========================================================

    @GetMapping("/pending")
    public ResponseEntity<List<AccessRequest>>
    getPendingRequests() {

        return ResponseEntity.ok(
                accessRequestService
                        .getPendingRequests()
        );
    }


    // =========================================================
    // APPROVE ACCESS REQUEST
    // =========================================================
    //
    // PUT /api/access-requests/1/approve
    //
    // Optional:
    // ?adminResponse=Approved for research work
    //
    // =========================================================

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRequest(

            @PathVariable Long id,

            @RequestParam(
                    required = false
            )
            String adminResponse

    ) {

        try {

            AccessRequest request =
                    accessRequestService
                            .approveRequest(
                                    id,
                                    adminResponse
                            );

            return ResponseEntity.ok(
                    request
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // REJECT ACCESS REQUEST
    // =========================================================
    //
    // PUT /api/access-requests/1/reject
    //
    // Optional:
    // ?adminResponse=Equipment unavailable
    //
    // =========================================================

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(

            @PathVariable Long id,

            @RequestParam(
                    required = false
            )
            String adminResponse

    ) {

        try {

            AccessRequest request =
                    accessRequestService
                            .rejectRequest(
                                    id,
                                    adminResponse
                            );

            return ResponseEntity.ok(
                    request
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}
