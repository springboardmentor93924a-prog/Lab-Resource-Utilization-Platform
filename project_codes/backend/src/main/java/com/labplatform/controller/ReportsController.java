package com.labplatform.controller;

import com.labplatform.service.ReportsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('LAB_MANAGER','DEPARTMENT_HEAD','INSTITUTION_ADMIN','SYSTEM_ADMIN')")
public class ReportsController {

    private final ReportsService reportsService;

    @GetMapping("/utilization/excel")
    public ResponseEntity<byte[]> utilizationExcel(@RequestParam Long institutionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) throws Exception {
        byte[] bytes = reportsService.equipmentUtilizationExcel(institutionId, from, to);
        return fileResponse(bytes, "utilization-report.xlsx",
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    }

    @GetMapping("/utilization/pdf")
    public ResponseEntity<byte[]> utilizationPdf(@RequestParam Long institutionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) throws Exception {
        byte[] bytes = reportsService.equipmentUtilizationPdf(institutionId, from, to);
        return fileResponse(bytes, "utilization-report.pdf", MediaType.APPLICATION_PDF);
    }

    @GetMapping("/costs/excel")
    public ResponseEntity<byte[]> costsExcel() throws Exception {
        byte[] bytes = reportsService.costReportExcel();
        return fileResponse(bytes, "cost-report.xlsx",
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    }

    private ResponseEntity<byte[]> fileResponse(byte[] bytes, String filename, MediaType type) {
        return ResponseEntity.ok()
                .contentType(type)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename).build().toString())
                .body(bytes);
    }
}
