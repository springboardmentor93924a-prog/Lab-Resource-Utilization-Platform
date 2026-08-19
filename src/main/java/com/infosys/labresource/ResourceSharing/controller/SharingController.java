package com.infosys.labresource.ResourceSharing.controller;

import com.infosys.labresource.ResourceSharing.dtos.SharingRequestDTO;
import com.infosys.labresource.ResourceSharing.dtos.SharingResponseDTO;
import com.infosys.labresource.ResourceSharing.service.SharingServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resource-sharing")
@RequiredArgsConstructor
public class SharingController {
    private final SharingServiceImpl sharingService;

    @PostMapping("/request")
    @PreAuthorize("hasAnyRole('RESEARCHER','LAB_MANAGER','DEPARTMENT_HEAD')")
    public ResponseEntity<SharingResponseDTO> createRequest(@RequestBody SharingRequestDTO reqDto, Authentication auth) {

        // requester comes from the logged in session, not from the request body
        return ResponseEntity.ok(sharingService.createRequest(reqDto, auth.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN')")
    public ResponseEntity<List<SharingResponseDTO>> getAllRequests() {
        return ResponseEntity.ok(sharingService.getAllRequests());
    }

    @GetMapping("/{requestId}")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN')")
    public ResponseEntity<SharingResponseDTO> getRequestById(@PathVariable Long requestId) {
        return ResponseEntity.ok(sharingService.getRequestById(requestId));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN')")
    public ResponseEntity<List<SharingResponseDTO>> getPendingRequests() {
        return ResponseEntity.ok(sharingService.getPendingRequests());
    }

    @PutMapping("/approve/{requestId}")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN')")
    public ResponseEntity<SharingResponseDTO> approveRequest(@PathVariable Long requestId, Authentication auth) {

        // approver identity comes from the token, it can no longer be passed in by the caller
        return ResponseEntity.ok(sharingService.approveRequest(requestId, auth.getName()));
    }

    @PutMapping("/reject/{requestId}")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN')")
    public ResponseEntity<SharingResponseDTO> rejectRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(sharingService.rejectRequest(requestId));
    }
}
