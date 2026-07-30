package com.labresource.controller;

import com.labresource.dto.resourcesharing.ResourceSharingRequestDto;
import com.labresource.dto.resourcesharing.ResourceSharingResponseDto;
import com.labresource.service.ResourceSharingRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resource-sharing")
public class ResourceSharingRequestController {

    private final ResourceSharingRequestService resourceSharingRequestService;

    public ResourceSharingRequestController(
            ResourceSharingRequestService resourceSharingRequestService
    ) {
        this.resourceSharingRequestService = resourceSharingRequestService;
    }

    @PostMapping
    public ResponseEntity<ResourceSharingResponseDto> createRequest(
            @RequestBody ResourceSharingRequestDto requestDto
    ) {
        return new ResponseEntity<>(
                resourceSharingRequestService.createRequest(requestDto),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<ResourceSharingResponseDto>> getAllRequests() {
        return ResponseEntity.ok(
                resourceSharingRequestService.getAllRequests()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceSharingResponseDto> getRequestById(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(
                resourceSharingRequestService.getRequestById(id)
        );
    }

    @GetMapping("/requester/{requesterId}")
    public ResponseEntity<List<ResourceSharingResponseDto>> getRequestsByRequester(
            @PathVariable String requesterId
    ) {
        return ResponseEntity.ok(
                resourceSharingRequestService.getRequestsByRequester(requesterId)
        );
    }

    @GetMapping("/requester-institution/{institutionId}")
    public ResponseEntity<List<ResourceSharingResponseDto>> getRequestsByRequesterInstitution(
            @PathVariable String institutionId
    ) {
        return ResponseEntity.ok(
                resourceSharingRequestService.getRequestsByRequesterInstitution(institutionId)
        );
    }

    @GetMapping("/provider-institution/{institutionId}")
    public ResponseEntity<List<ResourceSharingResponseDto>> getRequestsByProviderInstitution(
            @PathVariable String institutionId
    ) {
        return ResponseEntity.ok(
                resourceSharingRequestService.getRequestsByProviderInstitution(institutionId)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ResourceSharingResponseDto>> getRequestsByStatus(
            @PathVariable String status
    ) {
        return ResponseEntity.ok(
                resourceSharingRequestService.getRequestsByStatus(status)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceSharingResponseDto> updateRequest(
            @PathVariable String id,
            @RequestBody ResourceSharingRequestDto requestDto
    ) {
        return ResponseEntity.ok(
                resourceSharingRequestService.updateRequest(id, requestDto)
        );
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ResourceSharingResponseDto> approveRequest(
            @PathVariable String id,
            @RequestParam String approvedById
    ) {
        return ResponseEntity.ok(
                resourceSharingRequestService.approveRequest(id, approvedById)
        );
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ResourceSharingResponseDto> rejectRequest(
            @PathVariable String id,
            @RequestParam String approvedById,
            @RequestParam String rejectionReason
    ) {
        return ResponseEntity.ok(
                resourceSharingRequestService.rejectRequest(
                        id,
                        approvedById,
                        rejectionReason
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRequest(
            @PathVariable String id
    ) {
        resourceSharingRequestService.deleteRequest(id);

        return ResponseEntity.ok("Resource sharing request deleted successfully.");
    }
}