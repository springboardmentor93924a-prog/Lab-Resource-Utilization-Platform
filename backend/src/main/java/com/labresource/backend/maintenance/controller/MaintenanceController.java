package com.labresource.backend.maintenance.controller;

import com.labresource.backend.maintenance.dto.MaintenanceReportDto;
import com.labresource.backend.maintenance.dto.MaintenanceRequestSummaryDto;
import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.maintenance.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping("/report")
    @PreAuthorize("hasAuthority('REPORT_EQUIPMENT_ISSUE')")
    public MaintenanceRequestSummaryDto report(@AuthenticationPrincipal UserPrincipal principal,
                                                @Valid @RequestBody MaintenanceReportDto request) {
        return maintenanceService.report(principal.getUserId(), request);
    }

    @GetMapping("/my")
    public List<MaintenanceRequestSummaryDto> myReports(@AuthenticationPrincipal UserPrincipal principal) {
        return maintenanceService.myReports(principal.getUserId());
    }
}
