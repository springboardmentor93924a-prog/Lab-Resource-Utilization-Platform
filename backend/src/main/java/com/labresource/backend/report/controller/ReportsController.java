package com.labresource.backend.report.controller;

import com.labresource.backend.report.dto.*;
import com.labresource.backend.report.entity.Report;
import com.labresource.backend.report.service.ReportService;
import com.labresource.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportsController {

    private final ReportService reportService;

    // ─── Migrated/Preserved Active Endpoints ───────────────────────────────

    @PostMapping("/generate")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public Report generateReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam String reportType,
            @RequestParam(required = false) Long departmentId,
            @RequestParam String format) throws IOException {
        return reportService.generateReport(
                principal.getUserId(),
                principal.getInstitutionId(),
                departmentId != null ? departmentId : principal.getDepartmentId(),
                reportType,
                format
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public List<Report> getReports(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long departmentId) {
        return reportService.getReports(principal.getInstitutionId(), departmentId);
    }

    // ─── New Dynamic Report Endpoints ──────────────────────────────────────

    @GetMapping("/utilization")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public List<EquipmentUtilizationReportDTO> getEquipmentUtilization(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long equipmentId) {
        return reportService.getEquipmentUtilizationReport(principal, from, to, departmentId, equipmentId);
    }

    @GetMapping("/maintenance")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public List<MaintenanceDowntimeReportDTO> getMaintenanceDowntime(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long equipmentId) {
        return reportService.getMaintenanceDowntimeReport(principal, from, to, departmentId, equipmentId);
    }

    @GetMapping("/bookings")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public List<BookingUsageReportDTO> getBookingUsage(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long equipmentId) {
        return reportService.getBookingUsageReport(principal, from, to, departmentId, equipmentId);
    }

    @GetMapping("/department-performance")
    @PreAuthorize("hasAnyAuthority('ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public DepartmentPerformanceReportDTO getDepartmentPerformance(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return reportService.getDepartmentPerformanceReport(principal, from, to);
    }

    @GetMapping("/compliance")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public ComplianceReportDTO getCompliance(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long departmentId) {
        return reportService.getComplianceReport(principal, departmentId);
    }

    @GetMapping("/sharing-cost")
    @PreAuthorize("hasAnyAuthority('ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public List<SharingCostReportDTO> getSharingCost(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long departmentId) {
        return reportService.getSharingCostReport(principal, departmentId);
    }

    @GetMapping("/issues")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public IssueSummaryResponseDTO getIssues(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long equipmentId,
            @RequestParam(required = false) String status, // represents category filter
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return reportService.getIssueSummaryReport(principal, departmentId, equipmentId, status, from, to);
    }
}
