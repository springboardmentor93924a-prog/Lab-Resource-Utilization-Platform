package com.labplatform.controller;

import com.labplatform.entity.Booking;
import com.labplatform.entity.Equipment;
import com.labplatform.entity.MaintenanceTask;
import com.labplatform.repository.BookingRepository;
import com.labplatform.repository.EquipmentRepository;
import com.labplatform.repository.MaintenanceTaskRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final MaintenanceTaskRepository maintenanceRepository;

    // 1. Export Utilization & Usage Report (CSV)
    @GetMapping("/export/utilization-csv")
    public void exportUtilizationCsv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"utilization_report.csv\"");

        PrintWriter writer = response.getWriter();
        writer.println("Equipment ID,Equipment Name,Category,Hourly Rate,Status,Department,Institution");

        List<Equipment> equipmentList = equipmentRepository.findAll();
        for (Equipment eq : equipmentList) {
            writer.printf("%d,\"%s\",\"%s\",%.2f,%s,\"%s\",\"%s\"\n",
                    eq.getId(), eq.getName(), eq.getCategory(), eq.getHourlyRate(),
                    eq.getStatus(), eq.getDepartment(),
                    eq.getInstitution() != null ? eq.getInstitution().getName() : "N/A");
        }
    }

    // 2. Export Inter-Institution Billing & Cost Report (CSV)
    @GetMapping("/export/billing-csv")
    public void exportBillingCsv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"billing_chargeback_report.csv\"");

        PrintWriter writer = response.getWriter();
        writer.println("Booking ID,Equipment Name,Researcher,Start Time,End Time,Total Cost ($),Inter-Institution,Status");

        List<Booking> bookings = bookingRepository.findAll();
        for (Booking b : bookings) {
            writer.printf("%d,\"%s\",\"%s\",%s,%s,%.2f,%b,%s\n",
                    b.getId(), b.getEquipment().getName(), b.getUser().getFullName(),
                    b.getStartTime(), b.getEndTime(), b.getTotalCost(),
                    b.getIsInterInstitution(), b.getStatus());
        }
    }

    // 3. Export Maintenance & Downtime Report (CSV)
    @GetMapping("/export/maintenance-csv")
    public void exportMaintenanceCsv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"maintenance_downtime_report.csv\"");

        PrintWriter writer = response.getWriter();
        writer.println("Task ID,Equipment Name,Description,Scheduled Date,Status,Completed Date,Service Notes");

        List<MaintenanceTask> tasks = maintenanceRepository.findAll();
        for (MaintenanceTask t : tasks) {
            writer.printf("%d,\"%s\",\"%s\",%s,%s,%s,\"%s\"\n",
                    t.getId(), t.getEquipment().getName(), t.getTaskDescription(),
                    t.getScheduledDate(), t.getStatus(),
                    t.getCompletedDate() != null ? t.getCompletedDate() : "Pending",
                    t.getServiceNotes() != null ? t.getServiceNotes() : "N/A");
        }
    }
}