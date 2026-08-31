package com.example.lab_platform.controller;

import com.example.lab_platform.dto.*;
import com.example.lab_platform.service.ReportService;
import com.example.lab_platform.util.ReportExportUtil;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    // Milestone 3 spec: Researcher/Student gets no report access; the
    // remaining tiers get institution/department-scoped or org-wide
    // access exactly like the existing Cost Management / Analytics
    // controllers already enforce.
    private static final String REPORT_ROLES = """
        hasAnyRole(
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """;

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // ================= A. Equipment Utilization =================
    @GetMapping("/equipment-utilization")
    @PreAuthorize(REPORT_ROLES)
    public EquipmentUtilizationReportDTO equipmentUtilization(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer departmentId,
            @RequestParam(required = false) Integer institutionId,
            @RequestParam(required = false) Integer equipmentId,
            @RequestParam(required = false) String category) {

        return reportService.getEquipmentUtilizationReport(
                startDate, endDate, departmentId, institutionId, equipmentId, category);
    }

    // ================= B. Department / Resource Usage =================
    @GetMapping("/department-usage")
    @PreAuthorize(REPORT_ROLES)
    public DepartmentUsageReportDTO departmentUsage(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer departmentId,
            @RequestParam(required = false) Integer institutionId) {

        return reportService.getDepartmentUsageReport(startDate, endDate, departmentId, institutionId);
    }

    // ================= C. Maintenance & Downtime =================
    @GetMapping("/maintenance-downtime")
    @PreAuthorize(REPORT_ROLES)
    public MaintenanceDowntimeReportDTO maintenanceDowntime(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer departmentId,
            @RequestParam(required = false) Integer institutionId,
            @RequestParam(required = false) Integer equipmentId) {

        return reportService.getMaintenanceDowntimeReport(
                startDate, endDate, departmentId, institutionId, equipmentId);
    }

    // ================= D. Inter-Institution Sharing =================
    @GetMapping("/inter-institution-sharing")
    @PreAuthorize(REPORT_ROLES)
    public SharingReportDTO interInstitutionSharing(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer institutionId,
            @RequestParam(required = false) String status) {

        return reportService.getInterInstitutionSharingReport(startDate, endDate, institutionId, status);
    }

    // ================= E. Procurement & Cost Analysis =================
    @GetMapping("/procurement-cost")
    @PreAuthorize(REPORT_ROLES)
    public ProcurementCostReportDTO procurementCost(
            @RequestParam(required = false) Integer departmentId,
            @RequestParam(required = false) Integer institutionId,
            @RequestParam(required = false) Integer equipmentId,
            @RequestParam(required = false) String category) {

        return reportService.getProcurementCostReport(departmentId, institutionId, equipmentId, category);
    }

    // ================= Export (PDF & Excel) =================
    // One pair of endpoints for all 5 report types - reportType selects
    // which report to compute and how to flatten it into a table; the
    // actual document rendering is shared via ReportExportUtil.
    @GetMapping("/{reportType}/export/{format}")
    @PreAuthorize(REPORT_ROLES)
    public ResponseEntity<byte[]> exportReport(
            @PathVariable String reportType,
            @PathVariable String format,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer departmentId,
            @RequestParam(required = false) Integer institutionId,
            @RequestParam(required = false) Integer equipmentId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {

        if (!"pdf".equalsIgnoreCase(format) && !"excel".equalsIgnoreCase(format)) {
            throw new RuntimeException("Unsupported export format. Use 'pdf' or 'excel'.");
        }

        String title;
        java.time.LocalDateTime generatedAt;
        java.util.Map<String, String> filters;
        List<String[]> summary = new ArrayList<>();
        String[] headers;
        List<String[]> rows = new ArrayList<>();

        switch (reportType) {

            case "equipment-utilization" -> {
                EquipmentUtilizationReportDTO report = reportService.getEquipmentUtilizationReport(
                        startDate, endDate, departmentId, institutionId, equipmentId, category);
                title = report.getReportTitle();
                generatedAt = report.getGeneratedAt();
                filters = report.getAppliedFilters();
                summary.add(new String[]{"Total Equipment", String.valueOf(report.getTotalEquipment())});
                summary.add(new String[]{"Average Utilization", report.getAverageUtilization() + "%"});
                summary.add(new String[]{"Total Booked Hours", String.valueOf(report.getTotalBookedHours())});
                summary.add(new String[]{"Highest Utilization Equipment", report.getHighestUtilizationEquipment()});
                summary.add(new String[]{"Lowest Utilization Equipment", report.getLowestUtilizationEquipment()});
                headers = new String[]{"Equipment", "Category", "Department", "Institution",
                        "Available Hrs", "Booked Hrs", "Idle Hrs", "Utilization %", "Bookings", "Status"};
                for (EquipmentUtilizationRowDTO r : report.getRows()) {
                    rows.add(new String[]{r.getEquipmentName(), r.getCategory(), r.getDepartmentName(),
                            r.getInstitutionName(), String.valueOf(r.getTotalAvailableHours()),
                            String.valueOf(r.getTotalBookedHours()), String.valueOf(r.getIdleHours()),
                            r.getUtilizationPercentage() + "%", String.valueOf(r.getBookingCount()),
                            r.getCurrentStatus()});
                }
            }

            case "department-usage" -> {
                DepartmentUsageReportDTO report =
                        reportService.getDepartmentUsageReport(startDate, endDate, departmentId, institutionId);
                title = report.getReportTitle();
                generatedAt = report.getGeneratedAt();
                filters = report.getAppliedFilters();
                summary.add(new String[]{"Total Departments", String.valueOf(report.getTotalDepartments())});
                summary.add(new String[]{"Total Bookings", String.valueOf(report.getTotalBookings())});
                summary.add(new String[]{"Total Usage Hours", String.valueOf(report.getTotalUsageHours())});
                summary.add(new String[]{"Most Active Department", report.getMostActiveDepartment()});
                headers = new String[]{"Department", "Equipment Count", "Bookings",
                        "Usage Hrs", "Available Hrs", "Utilization %", "Most Used Equipment"};
                for (DepartmentUsageRowDTO r : report.getRows()) {
                    rows.add(new String[]{r.getDepartmentName(), String.valueOf(r.getEquipmentCount()),
                            String.valueOf(r.getBookingCount()), String.valueOf(r.getTotalUsageHours()),
                            String.valueOf(r.getTotalAvailableHours()), r.getUtilizationPercentage() + "%",
                            r.getMostUsedEquipment()});
                }
            }

            case "maintenance-downtime" -> {
                MaintenanceDowntimeReportDTO report = reportService.getMaintenanceDowntimeReport(
                        startDate, endDate, departmentId, institutionId, equipmentId);
                title = report.getReportTitle();
                generatedAt = report.getGeneratedAt();
                filters = report.getAppliedFilters();
                summary.add(new String[]{"Total Maintenance Events", String.valueOf(report.getTotalMaintenanceEvents())});
                summary.add(new String[]{"Total Downtime Events", String.valueOf(report.getTotalDowntimeEvents())});
                summary.add(new String[]{"Total Downtime Hours", String.valueOf(report.getTotalDowntimeHours())});
                summary.add(new String[]{"Average Downtime Hours", String.valueOf(report.getAverageDowntimeHours())});
                summary.add(new String[]{"Equipment With Highest Downtime", report.getEquipmentWithHighestDowntime()});
                headers = new String[]{"Equipment", "Department", "Type", "Date", "Status",
                        "Work Order Status", "Technician", "Downtime Hrs", "Reason"};
                for (MaintenanceDowntimeRowDTO r : report.getRows()) {
                    rows.add(new String[]{r.getEquipmentName(), r.getDepartmentName(), r.getMaintenanceType(),
                            String.valueOf(r.getMaintenanceDate()), r.getMaintenanceStatus(),
                            r.getWorkOrderStatus(), r.getAssignedTechnician(),
                            String.valueOf(r.getDowntimeHours()), r.getDowntimeReason()});
                }
            }

            case "inter-institution-sharing" -> {
                SharingReportDTO report =
                        reportService.getInterInstitutionSharingReport(startDate, endDate, institutionId, status);
                title = report.getReportTitle();
                generatedAt = report.getGeneratedAt();
                filters = report.getAppliedFilters();
                summary.add(new String[]{"Total Requests", String.valueOf(report.getTotalRequests())});
                summary.add(new String[]{"Approved", String.valueOf(report.getApprovedRequests())});
                summary.add(new String[]{"Rejected", String.valueOf(report.getRejectedRequests())});
                summary.add(new String[]{"Pending", String.valueOf(report.getPendingRequests())});
                summary.add(new String[]{"Most Shared Equipment", report.getMostSharedEquipment()});
                summary.add(new String[]{"Most Active Institution", report.getMostActiveInstitution()});
                headers = new String[]{"Request ID", "Equipment", "Requesting Institution",
                        "Providing Institution", "Request Date", "Status"};
                for (SharingReportRowDTO r : report.getRows()) {
                    rows.add(new String[]{String.valueOf(r.getRequestId()), r.getEquipmentName(),
                            r.getRequestingInstitution(), r.getProvidingInstitution(),
                            String.valueOf(r.getRequestDate()), r.getStatus()});
                }
            }

            case "procurement-cost" -> {
                ProcurementCostReportDTO report = reportService.getProcurementCostReport(
                        departmentId, institutionId, equipmentId, category);
                title = report.getReportTitle();
                generatedAt = report.getGeneratedAt();
                filters = report.getAppliedFilters();
                summary.add(new String[]{"Total Purchase Cost", String.valueOf(report.getTotalPurchaseCost())});
                summary.add(new String[]{"Total Usage Cost", String.valueOf(report.getTotalUsageCost())});
                summary.add(new String[]{"Total Maintenance Cost", String.valueOf(report.getTotalMaintenanceCost())});
                summary.add(new String[]{"Total Operational Cost", String.valueOf(report.getTotalOperationalCost())});
                summary.add(new String[]{"Highest Cost Equipment", report.getHighestCostEquipment()});
                summary.add(new String[]{"Equipment Missing Purchase Cost", String.valueOf(report.getEquipmentMissingPurchaseCost())});
                headers = new String[]{"Equipment", "Category", "Department", "Institution", "Purchase Date",
                        "Purchase Cost", "Usage Cost", "Maintenance Cost", "Total Operational Cost",
                        "Utilization %", "Cost / Usage Hr"};
                for (ProcurementCostRowDTO r : report.getRows()) {
                    rows.add(new String[]{r.getEquipmentName(), r.getCategory(), r.getDepartmentName(),
                            r.getInstitutionName(), String.valueOf(r.getPurchaseDate()),
                            r.getPurchaseCost() != null ? String.valueOf(r.getPurchaseCost()) : "N/A",
                            String.valueOf(r.getUsageCost()), String.valueOf(r.getMaintenanceCost()),
                            String.valueOf(r.getTotalOperationalCost()), r.getUtilizationPercentage() + "%",
                            r.getCostPerUsageHour() != null ? String.valueOf(r.getCostPerUsageHour()) : "N/A"});
                }
            }

            default -> throw new RuntimeException(
                    "Unknown report type: " + reportType
                            + ". Valid types: equipment-utilization, department-usage, "
                            + "maintenance-downtime, inter-institution-sharing, procurement-cost.");
        }

        byte[] fileBytes;
        MediaType contentType;
        String extension;

        if ("pdf".equalsIgnoreCase(format)) {
            fileBytes = ReportExportUtil.generatePdf(title, generatedAt, filters, summary, headers, rows);
            contentType = MediaType.APPLICATION_PDF;
            extension = "pdf";
        } else {
            fileBytes = ReportExportUtil.generateExcel(title, generatedAt, filters, summary, headers, rows);
            contentType = MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            extension = "xlsx";
        }

        String filename = reportType + "-report." + extension;

        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(fileBytes);
    }
}
