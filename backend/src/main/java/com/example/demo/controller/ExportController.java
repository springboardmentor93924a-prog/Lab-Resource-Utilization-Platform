package com.example.demo.controller;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.UtilizationRepository;

@RestController
public class ExportController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UtilizationRepository utilizationRepository;

    @GetMapping("/api/export/bookings")
    public ResponseEntity<byte[]> exportBookings() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8);
        writer.println("booking_id,equipment_id,user_id,booking_start,booking_end,status,purpose");
        bookingRepository.findAll().forEach(b -> writer.printf("%d,%d,%d,%s,%s,%s,%s%n",
                b.getBookingId(), b.getEquipment().getEquipmentId(), b.getUser().getUserId(),
                b.getBookingStart(), b.getBookingEnd(), b.getStatus(), b.getPurpose()));
        writer.flush();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bookings.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(out.toByteArray());
    }

    @GetMapping("/api/export/utilization")
    public ResponseEntity<byte[]> exportUtilization() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8);
               writer.println("utilization_id,equipment_id,booking_id,department_id,usage_date,hours_used");
        utilizationRepository.findAll().forEach(u -> writer.printf("%d,%d,%d,%d,%s,%s%n",
                u.getUtilizationId(), u.getEquipment().getEquipmentId(), u.getBooking().getBookingId(),
                u.getDepartment().getDepartmentId(), u.getUsageDate(), u.getHoursUsed()));
        writer.flush();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=utilization.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(out.toByteArray());
    }
}