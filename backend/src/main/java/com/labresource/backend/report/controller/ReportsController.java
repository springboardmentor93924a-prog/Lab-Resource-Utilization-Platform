package com.labresource.backend.report.controller;

import com.labresource.backend.report.dto.*;
import com.labresource.backend.report.entity.Report;
import com.labresource.backend.report.service.ReportCsvExportService;
import com.labresource.backend.report.service.ReportExcelExportService;
import com.labresource.backend.report.service.ReportPdfExportService;
import com.labresource.backend.report.service.ReportService;
import com.labresource.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
    private final ReportPdfExportService pdfExportService;
    private final ReportExcelExportService excelExportService;
    private final ReportCsvExportService csvExportService;

    // ─── Generate & Fetch Preserved Reports ─────────────────────────────────

    @Deprecated
    @PostMapping("/generate")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
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
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public List<Report> getReports(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long departmentId) {
        return reportService.getReports(principal, departmentId);
    }

    // ─── Dynamic Reports Endpoints (All 7 Available to INSTITUTION_ADMIN) ────

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
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public List<MaintenanceDowntimeReportDTO> getMaintenanceDowntime(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long equipmentId) {
        return reportService.getMaintenanceDowntimeReport(principal, from, to, departmentId, equipmentId);
    }

    @GetMapping("/bookings")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public List<BookingUsageReportDTO> getBookingUsage(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long equipmentId) {
        return reportService.getBookingUsageReport(principal, from, to, departmentId, equipmentId);
    }

    @GetMapping("/department-performance")
    @PreAuthorize("hasAnyAuthority('ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public DepartmentPerformanceReportDTO getDepartmentPerformance(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long departmentId) {
        return reportService.getDepartmentPerformanceReport(principal, from, to, departmentId);
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
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public IssueSummaryResponseDTO getIssues(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long equipmentId,
            @RequestParam(required = false) String status, // represents category filter
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return reportService.getIssueSummaryReport(principal, departmentId, equipmentId, status, from, to);
    }

    // ─── Milestone 3 — Phase 1: New Analytics Report Endpoints ────────────────

    @GetMapping("/utilization-effectiveness")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN')")
    public UtilizationEffectivenessReportDto getUtilizationEffectivenessReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long laboratoryId) {
        return reportService.getUtilizationEffectivenessReport(principal, from, to, departmentId, laboratoryId);
    }

    @GetMapping("/cost-analysis")
    @PreAuthorize("hasAnyAuthority('ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN')")
    public CostAnalysisReportDto getCostAnalysisReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String fiscalYear) {
        return reportService.getCostAnalysisReport(principal, from, to, departmentId, fiscalYear);
    }

    // ─── Milestone 3 — Phase 3: Real Export Endpoints ─────────────────────────

    @GetMapping("/utilization-effectiveness/export/pdf")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN')")
    public ResponseEntity<byte[]> exportUtilizationPdf(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long laboratoryId) {
        UtilizationEffectivenessReportDto report = reportService.getUtilizationEffectivenessReport(principal, from, to, departmentId, laboratoryId);
        byte[] pdfBytes = pdfExportService.exportUtilizationPdf(report);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"utilization-effectiveness-report.pdf\"")
                .body(pdfBytes);
    }

    @GetMapping("/utilization-effectiveness/export/excel")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN')")
    public ResponseEntity<byte[]> exportUtilizationExcel(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long laboratoryId) {
        UtilizationEffectivenessReportDto report = reportService.getUtilizationEffectivenessReport(principal, from, to, departmentId, laboratoryId);
        byte[] excelBytes = excelExportService.exportUtilizationExcel(report);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"utilization-effectiveness-report.xlsx\"")
                .body(excelBytes);
    }

    @GetMapping("/utilization-effectiveness/export/csv")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN')")
    public ResponseEntity<byte[]> exportUtilizationCsv(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long laboratoryId) {
        UtilizationEffectivenessReportDto report = reportService.getUtilizationEffectivenessReport(principal, from, to, departmentId, laboratoryId);
        byte[] csvBytes = csvExportService.exportUtilizationCsv(report);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"utilization-effectiveness-report.csv\"")
                .body(csvBytes);
    }

    @GetMapping("/cost-analysis/export/pdf")
    @PreAuthorize("hasAnyAuthority('ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN')")
    public ResponseEntity<byte[]> exportCostPdf(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String fiscalYear) {
        CostAnalysisReportDto report = reportService.getCostAnalysisReport(principal, from, to, departmentId, fiscalYear);
        byte[] pdfBytes = pdfExportService.exportCostPdf(report);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cost-analysis-report.pdf\"")
                .body(pdfBytes);
    }

    @GetMapping("/cost-analysis/export/excel")
    @PreAuthorize("hasAnyAuthority('ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN')")
    public ResponseEntity<byte[]> exportCostExcel(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String fiscalYear) {
        CostAnalysisReportDto report = reportService.getCostAnalysisReport(principal, from, to, departmentId, fiscalYear);
        byte[] excelBytes = excelExportService.exportCostExcel(report);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cost-analysis-report.xlsx\"")
                .body(excelBytes);
    }

    @GetMapping("/cost-analysis/export/csv")
    @PreAuthorize("hasAnyAuthority('ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN')")
    public ResponseEntity<byte[]> exportCostCsv(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String fiscalYear) {
        CostAnalysisReportDto report = reportService.getCostAnalysisReport(principal, from, to, departmentId, fiscalYear);
        byte[] csvBytes = csvExportService.exportCostCsv(report);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cost-analysis-report.csv\"")
                .body(csvBytes);
    }
}
