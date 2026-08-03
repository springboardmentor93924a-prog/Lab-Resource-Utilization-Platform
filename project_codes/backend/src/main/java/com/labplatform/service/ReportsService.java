package com.labplatform.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.labplatform.entity.CostRecord;
import com.labplatform.entity.Equipment;
import com.labplatform.repository.CostRecordRepository;
import com.labplatform.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportsService {

    private final EquipmentRepository equipmentRepository;
    private final CostRecordRepository costRecordRepository;
    private final AnalyticsService analyticsService;

    /** Equipment utilization report as an .xlsx workbook. */
    public byte[] equipmentUtilizationExcel(Long institutionId, java.time.LocalDateTime from, java.time.LocalDateTime to) throws IOException {
        List<AnalyticsService.UtilizationSummary> summaries = analyticsService.heatmapForInstitution(institutionId, from, to);

        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Utilization Report");
            Row header = sheet.createRow(0);
            String[] columns = {"Equipment", "Utilization %", "Total Bookings", "Completed", "No-Shows", "Idle Hours"};
            for (int i = 0; i < columns.length; i++) header.createCell(i).setCellValue(columns[i]);

            int rowIdx = 1;
            for (AnalyticsService.UtilizationSummary s : summaries) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(s.getEquipmentName());
                row.createCell(1).setCellValue(s.getUtilizationRatePercent());
                row.createCell(2).setCellValue(s.getTotalBookings());
                row.createCell(3).setCellValue(s.getCompletedBookings());
                row.createCell(4).setCellValue(s.getNoShowBookings());
                row.createCell(5).setCellValue(s.getIdleHours());
            }
            for (int i = 0; i < columns.length; i++) sheet.autoSizeColumn(i);

            workbook.write(out);
            return out.toByteArray();
        }
    }

    /** Equipment utilization report as a PDF document. */
    public byte[] equipmentUtilizationPdf(Long institutionId, java.time.LocalDateTime from, java.time.LocalDateTime to) throws IOException {
        List<AnalyticsService.UtilizationSummary> summaries = analyticsService.heatmapForInstitution(institutionId, from, to);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PdfWriter writer = new PdfWriter(out);
             PdfDocument pdf = new PdfDocument(writer);
             Document document = new Document(pdf)) {

            document.add(new Paragraph("Equipment Utilization Report").setBold().setFontSize(16));
            document.add(new Paragraph("Institution ID: " + institutionId + "   Window: " + from + " to " + to));

            Table table = new Table(6);
            for (String h : new String[]{"Equipment", "Utilization %", "Bookings", "Completed", "No-Shows", "Idle Hrs"}) {
                table.addHeaderCell(new Cell().add(new Paragraph(h).setBold()));
            }
            for (AnalyticsService.UtilizationSummary s : summaries) {
                table.addCell(s.getEquipmentName());
                table.addCell(String.valueOf(s.getUtilizationRatePercent()));
                table.addCell(String.valueOf(s.getTotalBookings()));
                table.addCell(String.valueOf(s.getCompletedBookings()));
                table.addCell(String.valueOf(s.getNoShowBookings()));
                table.addCell(String.valueOf(s.getIdleHours()));
            }
            document.add(table);
        }
        return out.toByteArray();
    }

    /** Cost / billing report as an .xlsx workbook. */
    public byte[] costReportExcel() throws IOException {
        List<CostRecord> records = costRecordRepository.findAll();

        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Cost Report");
            Row header = sheet.createRow(0);
            String[] columns = {"Equipment", "Department", "Amount", "Charge Type", "Date"};
            for (int i = 0; i < columns.length; i++) header.createCell(i).setCellValue(columns[i]);

            int rowIdx = 1;
            for (CostRecord r : records) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(r.getEquipment() != null ? r.getEquipment().getName() : "");
                row.createCell(1).setCellValue(r.getDepartment() != null ? r.getDepartment() : "");
                row.createCell(2).setCellValue(r.getAmount() != null ? r.getAmount().doubleValue() : 0);
                row.createCell(3).setCellValue(r.getChargeType());
                row.createCell(4).setCellValue(r.getCreatedAt() != null ? r.getCreatedAt().toString() : "");
            }
            for (int i = 0; i < columns.length; i++) sheet.autoSizeColumn(i);

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
