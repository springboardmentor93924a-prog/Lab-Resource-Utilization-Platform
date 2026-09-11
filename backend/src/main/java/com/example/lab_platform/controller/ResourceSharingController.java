package com.example.lab_platform.controller;

import com.example.lab_platform.entity.ResourceSharingRequest;
import com.example.lab_platform.service.ResourceSharingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resource-sharing")
@CrossOrigin(origins = "${app.frontend-base-url}")
public class ResourceSharingController {

    private final ResourceSharingService resourceSharingService;

    public ResourceSharingController(ResourceSharingService resourceSharingService) {
        this.resourceSharingService = resourceSharingService;
    }

    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    @GetMapping("/requests")
    public List<ResourceSharingRequest> getAllRequests() {
        return resourceSharingService.getAllRequests();
    }

    // Creating a cross-institution request is an institutional decision,
    // not a personal one — a Student doesn't initiate this (they book
    // equipment; a Lab Manager/Dept Head/admin negotiates sharing).
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    @PostMapping("/requests")
    public ResponseEntity<ResourceSharingRequest> createRequest(@RequestBody ResourceSharingRequest request) {
        return ResponseEntity.ok(resourceSharingService.createRequest(request));
    }

    // Approve/Reject a cross-institution sharing request.
    //   - LAB_MANAGER / DEPARTMENT_HEAD: the only human decision-makers,
    //     scoped to their own institution being the equipment owner
    //     (enforced in ResourceSharingServiceImpl.updateStatus)
    //   - INSTITUTION_ADMIN: no longer allowed to approve/reject here —
    //     removed per product decision; Institution Admin keeps
    //     read-only visibility via getAllRequests only
    //   - SYSTEM_ADMIN: platform-wide override, not institution-scoped
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'SYSTEM_ADMIN')")
    @PutMapping("/requests/{id}/status")
    public ResponseEntity<ResourceSharingRequest> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(resourceSharingService.updateStatus(id, status));
    }
}