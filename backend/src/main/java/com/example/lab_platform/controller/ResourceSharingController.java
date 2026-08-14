package com.example.lab_platform.controller;

import com.example.lab_platform.entity.Institution;
import com.example.lab_platform.entity.ResourceSharingRequest;
import com.example.lab_platform.repository.InstitutionRepository;
import com.example.lab_platform.repository.ResourceSharingRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/resource-sharing")
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceSharingController {

    private final ResourceSharingRepository sharingRepository;
    private final InstitutionRepository institutionRepository;

    public ResourceSharingController(ResourceSharingRepository sharingRepository,
                                      InstitutionRepository institutionRepository) {
        this.sharingRepository = sharingRepository;
        this.institutionRepository = institutionRepository;
    }

    // Any authenticated user can view requests
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/requests")
    public List<ResourceSharingRequest> getAllRequests() {
        return sharingRepository.findAll();
    }

    // Only managers+ can create a sharing request on behalf of their institution
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    @PostMapping("/requests")
    public ResponseEntity<ResourceSharingRequest> createRequest(@RequestBody ResourceSharingRequest request) {

        Institution sender = institutionRepository.findById(
                request.getSenderInstitution().getInstitutionId()
        ).orElseThrow(() -> new RuntimeException("Sender institution not found"));

        Institution receiver = institutionRepository.findById(
                request.getReceiverInstitution().getInstitutionId()
        ).orElseThrow(() -> new RuntimeException("Receiver institution not found"));

        request.setSenderInstitution(sender);
        request.setReceiverInstitution(receiver);
        request.setStatus("PENDING");

        return ResponseEntity.ok(sharingRepository.save(request));
    }

    // Only managers+ can approve/reject — this closes the security hole
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    @PutMapping("/requests/{id}/status")
    public ResponseEntity<ResourceSharingRequest> updateStatus(@PathVariable Long id, @RequestParam String status) {
        Optional<ResourceSharingRequest> optionalRequest = sharingRepository.findById(id);
        if (optionalRequest.isPresent()) {
            ResourceSharingRequest req = optionalRequest.get();
            req.setStatus(status.toUpperCase());
            sharingRepository.save(req);
            return ResponseEntity.ok(req);
        }
        return ResponseEntity.notFound().build();
    }
}