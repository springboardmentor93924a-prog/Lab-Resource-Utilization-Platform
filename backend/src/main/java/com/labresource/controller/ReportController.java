package com.labresource.controller;

import com.labresource.dto.BillingRecordResponseDto;
import com.labresource.dto.CostRecordResponseDto;
import com.labresource.dto.ReportResponseDto;
import com.labresource.dto.booking.BookingResponse;
import com.labresource.dto.calibration.CalibrationResponse;
import com.labresource.dto.equipment.EquipmentResponse;
import com.labresource.dto.institution.InstitutionResponse;
import com.labresource.dto.maintenance.MaintenanceResponse;
import com.labresource.service.ReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(
            ReportService reportService
    ) {
        this.reportService = reportService;
    }

    /*
     * Equipment report
     */
    @GetMapping("/equipment")
    public ResponseEntity<List<EquipmentResponse>>
    getEquipmentReport() {

        return ResponseEntity.ok(
                reportService.getEquipmentReport()
        );
    }

    /*
     * Booking report
     */
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>>
    getBookingReport() {

        return ResponseEntity.ok(
                reportService.getBookingReport()
        );
    }

    /*
     * Maintenance report
     */
    @GetMapping("/maintenance")
    public ResponseEntity<List<MaintenanceResponse>>
    getMaintenanceReport() {

        return ResponseEntity.ok(
                reportService.getMaintenanceReport()
        );
    }

    /*
     * Calibration report
     */
    @GetMapping("/calibrations")
    public ResponseEntity<List<CalibrationResponse>>
    getCalibrationReport() {

        return ResponseEntity.ok(
                reportService.getCalibrationReport()
        );
    }

    /*
     * Cost report
     */
    @GetMapping("/costs")
    public ResponseEntity<List<CostRecordResponseDto>>
    getCostReport() {

        return ResponseEntity.ok(
                reportService.getCostReport()
        );
    }

    /*
     * Billing report
     */
    @GetMapping("/billing")
    public ResponseEntity<List<BillingRecordResponseDto>>
    getBillingReport() {

        return ResponseEntity.ok(
                reportService.getBillingReport()
        );
    }

    /*
     * Institution report
     */
    @GetMapping("/institutions")
    public ResponseEntity<List<InstitutionResponse>>
    getInstitutionReport() {

        return ResponseEntity.ok(
                reportService.getInstitutionReport()
        );
    }

    /*
     * Dashboard summary report
     */
    @GetMapping("/dashboard-summary")
    public ResponseEntity<ReportResponseDto>
    getDashboardSummary() {

        return ResponseEntity.ok(
                reportService.getDashboardSummary()
        );
    }

    /*
     * Revenue summary report
     */
    @GetMapping("/revenue-summary")
    public ResponseEntity<ReportResponseDto>
    getRevenueSummary() {

        return ResponseEntity.ok(
                reportService.getRevenueSummary()
        );
    }
}