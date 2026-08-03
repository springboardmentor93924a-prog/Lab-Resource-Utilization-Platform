package com.labplatform.controller;

import com.labplatform.dto.ApiResponse;
import com.labplatform.entity.SharingRequest;
import com.labplatform.entity.SharingRequestStatus;
import com.labplatform.entity.User;
import com.labplatform.service.SharingService;
import com.labplatform.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/sharing")
@RequiredArgsConstructor
public class SharingController {

    private final SharingService sharingService;

    @PostMapping
    public ResponseEntity<ApiResponse<SharingRequest>> request(@RequestParam Long equipmentId,
            @RequestParam String justification, @RequestParam(required = false) BigDecimal proposedFee) {
        User user = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Sharing request submitted",
                sharingService.request(user, equipmentId, justification, proposedFee)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('LAB_MANAGER','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<List<SharingRequest>>> all(@RequestParam(required = false) SharingRequestStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(status != null ? sharingService.byStatus(status) : sharingService.all()));
    }

    @GetMapping("/institution/{institutionId}")
    public ResponseEntity<ApiResponse<List<SharingRequest>>> forInstitution(@PathVariable Long institutionId) {
        return ResponseEntity.ok(ApiResponse.ok(sharingService.forInstitution(institutionId)));
    }

    @PatchMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<SharingRequest>> review(@PathVariable Long id, @RequestParam boolean approve) {
        User reviewer = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok("Sharing request reviewed", sharingService.review(id, reviewer, approve)));
    }
}
