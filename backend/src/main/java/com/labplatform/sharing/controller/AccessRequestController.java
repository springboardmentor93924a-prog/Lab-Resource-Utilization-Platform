package com.labplatform.sharing.controller;

import com.labplatform.sharing.dto.AccessRequestCreateRequest;
import com.labplatform.sharing.dto.AccessRequestResponse;
import com.labplatform.sharing.service.AccessRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.labplatform.sharing.dto.InterInstitutionSharingReportRow;
import java.time.LocalDate;
import org.springframework.web.bind.annotation.RequestParam;





import java.util.List;

@RestController
@RequestMapping("/api/access-requests")
public class AccessRequestController {

    private final AccessRequestService accessRequestService;

    public AccessRequestController(AccessRequestService accessRequestService) {
        this.accessRequestService = accessRequestService;
    }

    @PostMapping
    public ResponseEntity<AccessRequestResponse> createRequest(@Valid @RequestBody AccessRequestCreateRequest request,
                                                               Authentication authentication) {
        AccessRequestResponse response = accessRequestService.createRequest(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AccessRequestResponse>> getPendingRequests(Authentication authentication) {
        return ResponseEntity.ok(accessRequestService.getPendingRequestsForMyInstitution(authentication.getName()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<AccessRequestResponse>> getMyRequests(Authentication authentication) {
        return ResponseEntity.ok(accessRequestService.getMyRequests(authentication.getName()));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<AccessRequestResponse> approveRequest(@PathVariable Integer id,
                                                                Authentication authentication) {
        return ResponseEntity.ok(accessRequestService.approveRequest(id, authentication.getName()));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<AccessRequestResponse> rejectRequest(@PathVariable Integer id,
                                                               Authentication authentication) {
        return ResponseEntity.ok(accessRequestService.rejectRequest(id, authentication.getName()));
    }

    @GetMapping("/reports/inter-institution-sharing")
    public ResponseEntity<List<InterInstitutionSharingReportRow>>
    getInterInstitutionSharingReport(
            @RequestParam("from") LocalDate from,
            @RequestParam("to") LocalDate to) {

        return ResponseEntity.ok(
                accessRequestService
                        .generateInterInstitutionSharingReport(
                                from,
                                to
                        )
        );
    }

}