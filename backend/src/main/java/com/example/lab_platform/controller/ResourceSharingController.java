package com.example.lab_platform.controller;

import com.example.lab_platform.entity.ResourceSharingRequest;
import com.example.lab_platform.repository.ResourceSharingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/resource-sharing")
@CrossOrigin(origins = "*")
public class ResourceSharingController {

    @Autowired
    private ResourceSharingRepository sharingRepository;

    // Get all sharing requests
    @GetMapping("/requests")
    public List<ResourceSharingRequest> getAllRequests() {
        return sharingRepository.findAll();
    }

    // Create a new resource sharing request
    @PostMapping("/requests")
    public ResourceSharingRequest createRequest(@RequestBody ResourceSharingRequest request) {
        return sharingRepository.save(request);
    }

    // Update request status (APPROVE or REJECT)
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