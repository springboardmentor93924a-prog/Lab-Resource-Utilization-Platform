package com.labresource.backend.issuereport.controller;

import com.labresource.backend.issuereport.dto.EligibleBookingDto;
import com.labresource.backend.issuereport.dto.IssueReportRequestDto;
import com.labresource.backend.issuereport.entity.EquipmentIssueReport;
import com.labresource.backend.issuereport.service.EquipmentIssueReportService;
import com.labresource.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issue-reports")
@RequiredArgsConstructor
public class EquipmentIssueReportController {

    private final EquipmentIssueReportService issueReportService;

    @GetMapping("/eligible-bookings")
    public List<EligibleBookingDto> getEligibleBookings(@AuthenticationPrincipal UserPrincipal principal) {
        return issueReportService.getEligibleBookings(principal.getUserId());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('REPORT_EQUIPMENT_ISSUE')")
    public EquipmentIssueReport reportIssue(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody IssueReportRequestDto dto) {
        return issueReportService.reportIssue(principal.getUserId(), dto);
    }

    @GetMapping("/my")
    public List<EquipmentIssueReport> myReports(@AuthenticationPrincipal UserPrincipal principal) {
        return issueReportService.myReports(principal.getUserId());
    }

    @GetMapping("/{id}")
    public EquipmentIssueReport getDetails(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return issueReportService.getIssueReportDetails(principal.getUserId(), id);
    }

    @GetMapping(value = "/{id}/download", produces = "application/pdf")
    public org.springframework.http.ResponseEntity<byte[]> downloadPdf(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @org.springframework.beans.factory.annotation.Autowired com.labresource.backend.common.service.ReceiptPdfGeneratorService pdfGenerator,
            @org.springframework.beans.factory.annotation.Autowired com.labresource.backend.auth.repository.AppUserRepository appUserRepository,
            @org.springframework.beans.factory.annotation.Autowired com.labresource.backend.department.repository.DepartmentRepository departmentRepository) {

        byte[] pdfBytes = issueReportService.downloadIssueReportPdf(principal.getUserId(), id, pdfGenerator, appUserRepository, departmentRepository);

        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"incident_report_" + id + ".pdf\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('VIEW_EQUIPMENT_ISSUES', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN')")
    public List<EquipmentIssueReport> getDepartmentIssues(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String status) {
        return issueReportService.getDepartmentIssues(principal.getDepartmentId(), status);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyAuthority('ASSIGN_EQUIPMENT_ISSUE', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN')")
    public EquipmentIssueReport assignTechnician(@PathVariable Long id, @RequestParam Long technicianId) {
        return issueReportService.assignTechnician(id, technicianId);
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyAuthority('RESOLVE_EQUIPMENT_ISSUE', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN')")
    public EquipmentIssueReport resolveIssue(@PathVariable Long id) {
        return issueReportService.resolveIssue(id);
    }

    @PostMapping("/{id}/inspect")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_TECHNICIAN', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN')")
    public EquipmentIssueReport inspectIssue(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) String conditionBefore,
            @RequestParam(required = false) String observedProblem,
            @RequestParam(required = false) java.math.BigDecimal estimatedRepairCost,
            @RequestParam(required = false) String recommendedAction,
            @RequestParam(required = false) String notes) {
        return issueReportService.inspectIssue(id, principal.getUserId(), conditionBefore, observedProblem, estimatedRepairCost, recommendedAction, notes);
    }

    @PostMapping("/{id}/decide-liability")
    @PreAuthorize("hasAnyAuthority('ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public EquipmentIssueReport decideLiability(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam String liabilityType,
            @RequestParam(required = false) java.math.BigDecimal studentAmount) {
        return issueReportService.decideLiability(id, principal.getUserId(), liabilityType, studentAmount);
    }
}
