package com.example.lab_platform.controller;

import com.example.lab_platform.dto.MaintenanceRequestDTO;
import com.example.lab_platform.entity.MaintenanceRequest;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.service.MaintenanceRequestService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/maintenance-requests")
@CrossOrigin(origins = "http://localhost:5173")
public class MaintenanceRequestController {

    private final MaintenanceRequestService maintenanceRequestService;

    public MaintenanceRequestController(
            MaintenanceRequestService maintenanceRequestService) {

        this.maintenanceRequestService = maintenanceRequestService;
    }

    // =========================================================
    // LIST / VIEW
    // Any authenticated project role can see requests.
    // =========================================================

    @PreAuthorize("""
        hasAnyRole(
            'STUDENT',
            'LAB_TECHNICIAN',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)
    @GetMapping
    public ResponseEntity<List<MaintenanceRequestDTO>> getAllRequests() {

        List<MaintenanceRequestDTO> requests =
                maintenanceRequestService.getAllRequests()
                        .stream()
                        .map(MaintenanceRequestDTO::fromEntity)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(requests);
    }

    @PreAuthorize("""
        hasAnyRole(
            'STUDENT',
            'LAB_TECHNICIAN',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)
    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceRequestDTO> getRequestById(@PathVariable Integer id) {
        return ResponseEntity.ok(
                MaintenanceRequestDTO.fromEntity(
                        maintenanceRequestService.getRequestById(id)
                )
        );
    }

    // =========================================================
    // CREATE MAINTENANCE REQUEST
    // Any authenticated project role can submit a request.
    // requestedBy is taken from the authenticated JWT user.
    // =========================================================

    @PreAuthorize("""
        hasAnyRole(
            'STUDENT',
            'LAB_TECHNICIAN',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)
    @PostMapping
    public ResponseEntity<MaintenanceRequestDTO> createRequest(
            @RequestBody MaintenanceRequest request,
            Authentication authentication) {

        User loggedInUser =
                (User) authentication.getPrincipal();

        request.setRequestedBy(loggedInUser);

        if (request.getRequestDate() == null) {
            request.setRequestDate(
                    java.time.LocalDate.now()
            );
        }

        if (request.getRequestStatus() == null
                || request.getRequestStatus().isBlank()) {

            request.setRequestStatus("PENDING");
        }

        MaintenanceRequest savedRequest =
                maintenanceRequestService.createRequest(request);

        return ResponseEntity.ok(MaintenanceRequestDTO.fromEntity(savedRequest));
    }

    // =========================================================
    // UPDATE / APPROVE / REJECT
    // Restricted to technicians and above — reviews a submitted
    // request (e.g. requestStatus -> "APPROVED" / "REJECTED"), and can
    // attach reviewer remarks. Approved requests are then turned into
    // a Work Order via POST /api/work-orders/from-request/{id}.
    // =========================================================

    @PreAuthorize("""
        hasAnyRole(
            'LAB_TECHNICIAN',
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)
    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceRequestDTO> updateRequest(
            @PathVariable Integer id,
            @RequestBody MaintenanceRequest request) {

        MaintenanceRequest updated =
                maintenanceRequestService.updateRequest(id, request);

        return ResponseEntity.ok(MaintenanceRequestDTO.fromEntity(updated));
    }
}
