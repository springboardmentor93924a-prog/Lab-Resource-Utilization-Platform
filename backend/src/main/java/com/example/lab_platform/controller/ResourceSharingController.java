package com.example.lab_platform.controller;

import com.example.lab_platform.entity.ResourceSharingRequest;
import com.example.lab_platform.service.ResourceSharingService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resource-sharing")
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceSharingController {

    private final ResourceSharingService resourceSharingService;

    public ResourceSharingController(ResourceSharingService resourceSharingService) {
        this.resourceSharingService = resourceSharingService;
    }

    // Any authenticated user can view requests
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/requests")
    public List<ResourceSharingRequest> getAllRequests() {
        return resourceSharingService.getAllRequests();
    }

    // Only managers+ can create a sharing request on behalf of their institution
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    @PostMapping("/requests")
    public ResponseEntity<ResourceSharingRequest> createRequest(@RequestBody ResourceSharingRequest request) {
        return ResponseEntity.ok(resourceSharingService.createRequest(request));
    }

    // Only managers+ can approve/reject — this closes the security hole
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    @PutMapping("/requests/{id}/status")
    public ResponseEntity<ResourceSharingRequest> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(resourceSharingService.updateStatus(id, status));
    }
}