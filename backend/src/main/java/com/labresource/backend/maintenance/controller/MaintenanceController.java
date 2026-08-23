package com.labresource.backend.maintenance.controller;

import com.labresource.backend.maintenance.dto.MaintenanceReportDto;
import com.labresource.backend.maintenance.dto.MaintenanceRequestSummaryDto;
import com.labresource.backend.maintenance.dto.TechnicianWorkloadDto;
import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.maintenance.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    @PostMapping("/promote")
    @PreAuthorize("hasAnyAuthority('CREATE_MAINTENANCE_REQUEST', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceRequestSummaryDto promoteIssue(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam Long issueReportId,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) Long technicianId) {
        return maintenanceService.createWorkOrderFromIssue(principal.getUserId(), issueReportId, priority, start, end, technicianId);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyAuthority('ASSIGN_MAINTENANCE', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceRequestSummaryDto assignTechnician(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam Long technicianId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return maintenanceService.assignTechnician(principal.getUserId(), id, technicianId, start, end);
    }

    @GetMapping("/{id}/eligible-technicians")
    @PreAuthorize("hasAnyAuthority('VIEW_TECHNICIAN_AVAILABILITY', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN')")
    public List<TechnicianWorkloadDto> getEligibleTechnicians(@PathVariable Long id) {
        return maintenanceService.getEligibleTechnicians(id);
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasAnyAuthority('UPDATE_MAINTENANCE', 'ROLE_LAB_TECHNICIAN', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceRequestSummaryDto startWork(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return maintenanceService.startWork(principal.getUserId(), id);
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyAuthority('COMPLETE_MAINTENANCE', 'ROLE_LAB_TECHNICIAN', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceRequestSummaryDto completeWork(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) String notes) {
        return maintenanceService.completeWork(principal.getUserId(), id, notes);
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("hasAnyAuthority('COMPLETE_MAINTENANCE', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceRequestSummaryDto verifyWork(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam boolean approved,
            @RequestParam String equipmentStatus) {
        return maintenanceService.verifyWork(principal.getUserId(), id, approved, equipmentStatus);
    }

    @GetMapping("/department")
    @PreAuthorize("hasAnyAuthority('VIEW_MAINTENANCE', 'ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public List<MaintenanceRequestSummaryDto> getDepartmentWorkOrders(@AuthenticationPrincipal UserPrincipal principal) {
        return maintenanceService.getDepartmentWorkOrders(principal.getDepartmentId());
    }

    @GetMapping("/technician")
    @PreAuthorize("hasAnyAuthority('VIEW_MAINTENANCE', 'ROLE_LAB_TECHNICIAN', 'ROLE_SYSTEM_ADMIN')")
    public List<MaintenanceRequestSummaryDto> getTechnicianTasks(@AuthenticationPrincipal UserPrincipal principal) {
        return maintenanceService.getTechnicianTasks(principal.getUserId());
    }
}
