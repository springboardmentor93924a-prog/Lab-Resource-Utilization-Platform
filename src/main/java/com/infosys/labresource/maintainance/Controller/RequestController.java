package com.infosys.labresource.maintainance.Controller;

import com.infosys.labresource.maintainance.Entities.MaintenanceRequest;
import com.infosys.labresource.maintainance.Service.MaintenanceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance/requests")
@RequiredArgsConstructor
public class RequestController {
    private final MaintenanceRequestService requestService;

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','RESEARCHER')")
    public ResponseEntity<MaintenanceRequest> createRequest(@RequestParam Long equipmentId, @RequestParam String reason, @RequestParam String priority, @RequestParam Integer duration, Authentication auth) {

        MaintenanceRequest request = requestService.createRequest(equipmentId, auth.getName(), reason, priority, duration);

        return new ResponseEntity<>(request, HttpStatus.CREATED);
    }


    @PutMapping("/approve/{requestId}")
    @PreAuthorize("hasRole('LAB_MANAGER')")
    public ResponseEntity<MaintenanceRequest> approveRequest(@PathVariable Long requestId) {

        return ResponseEntity.ok(requestService.approveRequest(requestId));
    }

    @PutMapping("/reject/{requestId}")
    @PreAuthorize("hasRole('LAB_MANAGER')")
    public ResponseEntity<MaintenanceRequest> rejectRequest(@PathVariable Long requestId) {

        return ResponseEntity.ok(requestService.rejectRequest(requestId));
    }

    @GetMapping("/{requestId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MaintenanceRequest> getRequest(@PathVariable Long requestId) {

        return ResponseEntity.ok(requestService.getRequest(requestId));
    }
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MaintenanceRequest>> getAllRequests() {

        return ResponseEntity.ok(requestService.getAllRequests());
    }
}
