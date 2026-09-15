package com.labresource.backend.report.service;

import com.labresource.backend.report.dto.CostAnalysisReportDto;
import com.labresource.backend.report.dto.ReportMetadataDto;
import com.labresource.backend.report.dto.UtilizationEffectivenessReportDto;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class ReportPdfExportService {

    private final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLACK);
    private final Font SUBTITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
    private final Font SECTION_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(30, 58, 138));
    private final Font HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
    private final Font BODY_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
    private final Font BODY_BOLD = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);

    private final NumberFormat CURRENCY_FORMAT = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));

    public byte[] exportUtilizationPdf(UtilizationEffectivenessReportDto report) {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Header
            document.add(new Paragraph("Utilization Effectiveness Report", TITLE_FONT));
            addMetadata(document, report.getMetadata());
            document.add(Chunk.NEWLINE);

            // Summary KPIs
            document.add(new Paragraph("1. Executive Utilization Summary", SECTION_FONT));
            document.add(Chunk.NEWLINE);
            UtilizationEffectivenessReportDto.UtilizationSummaryDto summary = report.getSummary();
            if (summary != null) {
                PdfPTable summaryTable = createTable(new String[]{"Metric", "Value"}, new float[]{2, 1});
                addTableRow(summaryTable, "Average Utilization Percentage", String.format("%.1f%%", summary.getAverageUtilizationPercentage() != null ? summary.getAverageUtilizationPercentage() : 0.0), true);
                addTableRow(summaryTable, "Total Used Hours", String.format("%.1f hrs", summary.getTotalUsedHours() != null ? summary.getTotalUsedHours() : 0.0), false);
                addTableRow(summaryTable, "Total Available Hours", String.format("%.1f hrs", summary.getTotalAvailableHours() != null ? summary.getTotalAvailableHours() : 0.0), false);
                addTableRow(summaryTable, "Total Idle Hours", String.format("%.1f hrs", summary.getTotalIdleHours() != null ? summary.getTotalIdleHours() : 0.0), false);
                addTableRow(summaryTable, "Total Equipment Count", String.valueOf(summary.getTotalEquipmentCount() != null ? summary.getTotalEquipmentCount() : 0), false);
                addTableRow(summaryTable, "Total Laboratory Count", String.valueOf(summary.getTotalLaboratoryCount() != null ? summary.getTotalLaboratoryCount() : 0), false);
                addTableRow(summaryTable, "Total Bookings Recorded", String.valueOf(summary.getTotalBookingCount() != null ? summary.getTotalBookingCount() : 0), false);
                document.add(summaryTable);
            }
            document.add(Chunk.NEWLINE);

            // Rankings
            document.add(new Paragraph("2. Utilization Highlights", SECTION_FONT));
            document.add(Chunk.NEWLINE);
            if (report.getMostUtilizedEquipment() != null) {
                UtilizationEffectivenessReportDto.EquipmentUtilizationRankDto most = report.getMostUtilizedEquipment();
                document.add(new Paragraph("• Most Utilized: " + most.getEquipmentName() + " (" + String.format("%.1f%%", most.getUtilizationPercentage()) + " - " + most.getUsedHours() + " hrs used)", BODY_BOLD));
            }
            if (report.getLeastUtilizedEquipment() != null) {
                UtilizationEffectivenessReportDto.EquipmentUtilizationRankDto least = report.getLeastUtilizedEquipment();
                document.add(new Paragraph("• Least Utilized: " + least.getEquipmentName() + " (" + String.format("%.1f%%", least.getUtilizationPercentage()) + " - " + least.getUsedHours() + " hrs used)", BODY_BOLD));
            }
            document.add(Chunk.NEWLINE);

            // Equipment Utilization Table
            document.add(new Paragraph("3. Equipment Utilization Breakdown", SECTION_FONT));
            document.add(Chunk.NEWLINE);
            List<UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto> eqList = report.getEquipmentUtilization();
            if (eqList != null && !eqList.isEmpty()) {
                PdfPTable eqTable = createTable(
                        new String[]{"Equipment", "Laboratory", "Used (h)", "Available (h)", "Idle (h)", "Utilization %", "Status"},
                        new float[]{2.5f, 2f, 1.2f, 1.2f, 1.2f, 1.3f, 1.2f}
                );
                for (UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto item : eqList) {
                    addTableCell(eqTable, item.getEquipmentName(), BODY_BOLD, Element.ALIGN_LEFT);
                    addTableCell(eqTable, item.getLaboratoryName() != null ? item.getLaboratoryName() : "-", BODY_FONT, Element.ALIGN_LEFT);
                    addTableCell(eqTable, String.format("%.1f", item.getUsedHours()), BODY_FONT, Element.ALIGN_RIGHT);
                    addTableCell(eqTable, String.format("%.1f", item.getAvailableHours()), BODY_FONT, Element.ALIGN_RIGHT);
                    addTableCell(eqTable, String.format("%.1f", item.getIdleHours()), BODY_FONT, Element.ALIGN_RIGHT);
                    addTableCell(eqTable, String.format("%.1f%%", item.getUtilizationPercentage()), BODY_BOLD, Element.ALIGN_RIGHT);
                    addTableCell(eqTable, item.getUtilizationStatus() != null ? item.getUtilizationStatus() : "LOW", BODY_FONT, Element.ALIGN_CENTER);
                }
                document.add(eqTable);
            } else {
                document.add(new Paragraph("No equipment utilization records for selected range.", BODY_FONT));
            }
            document.add(Chunk.NEWLINE);

            // Department Comparison if present
            if (report.getDepartmentComparison() != null && !report.getDepartmentComparison().isEmpty()) {
                document.add(new Paragraph("4. Department Utilization Comparison", SECTION_FONT));
                document.add(Chunk.NEWLINE);
                PdfPTable deptTable = createTable(
                        new String[]{"Department", "Equipment", "Labs", "Used (h)", "Available (h)", "Utilization %"},
                        new float[]{2.5f, 1.2f, 1f, 1.3f, 1.3f, 1.5f}
                );
                for (UtilizationEffectivenessReportDto.DepartmentUtilizationComparisonDto dept : report.getDepartmentComparison()) {
                    addTableCell(deptTable, dept.getDepartmentName(), BODY_BOLD, Element.ALIGN_LEFT);
                    addTableCell(deptTable, String.valueOf(dept.getEquipmentCount()), BODY_FONT, Element.ALIGN_RIGHT);
                    addTableCell(deptTable, String.valueOf(dept.getLaboratoryCount()), BODY_FONT, Element.ALIGN_RIGHT);
                    addTableCell(deptTable, String.format("%.1f", dept.getUsedHours()), BODY_FONT, Element.ALIGN_RIGHT);
                    addTableCell(deptTable, String.format("%.1f", dept.getAvailableHours()), BODY_FONT, Element.ALIGN_RIGHT);
                    addTableCell(deptTable, String.format("%.1f%%", dept.getUtilizationPercentage()), BODY_BOLD, Element.ALIGN_RIGHT);
                }
                document.add(deptTable);
            }

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Utilization PDF report", e);
        }

        return out.toByteArray();
    }

    public byte[] exportCostPdf(CostAnalysisReportDto report) {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Header
            document.add(new Paragraph("Cost Analysis & Budget Audit Report", TITLE_FONT));
            addMetadata(document, report.getMetadata());
            document.add(Chunk.NEWLINE);

            // Summary
            document.add(new Paragraph("1. Financial Cost Summary", SECTION_FONT));
            document.add(Chunk.NEWLINE);
            CostAnalysisReportDto.CostSummaryBreakdownDto summary = report.getSummary();
            if (summary != null) {
                PdfPTable summaryTable = createTable(new String[]{"Financial Category", "Amount"}, new float[]{2, 1});
                addTableRow(summaryTable, "Total Cost Amount", formatMoney(summary.getTotalCost()), true);
                addTableRow(summaryTable, "Equipment Usage Cost", formatMoney(summary.getUsageCost()), false);
                addTableRow(summaryTable, "Maintenance Expense", formatMoney(summary.getMaintenanceCost()), false);
                addTableRow(summaryTable, "Resource Sharing Fee", formatMoney(summary.getSharingFee()), false);
                addTableRow(summaryTable, "Damage Charge Penalties", formatMoney(summary.getDamageCharge()), false);
                addTableRow(summaryTable, "Total Financial Cost Records", String.valueOf(summary.getTotalCostsCount() != null ? summary.getTotalCostsCount() : 0), false);
                document.add(summaryTable);
            }
            document.add(Chunk.NEWLINE);

            // Budget
            document.add(new Paragraph("2. Department Budget Allocation", SECTION_FONT));
            document.add(Chunk.NEWLINE);
            CostAnalysisReportDto.BudgetReportSummaryDto budget = report.getBudget();
            if (budget != null) {
                PdfPTable budgetTable = createTable(new String[]{"Budget Metric", "Value"}, new float[]{2, 1});
                addTableRow(budgetTable, "Fiscal Year", budget.getFiscalYear(), false);
                addTableRow(budgetTable, "Allocated Budget", formatMoney(budget.getAllocatedAmount()), false);
                addTableRow(budgetTable, "Used Amount", formatMoney(budget.getUsedAmount()), false);
                addTableRow(budgetTable, "Remaining Balance", formatMoney(budget.getRemainingAmount()), false);
                addTableRow(budgetTable, "Consumption Rate", String.format("%.1f%%", budget.getUsedPercentage() != null ? budget.getUsedPercentage().doubleValue() : 0.0), true);
                addTableRow(budgetTable, "Budget Warning Status", budget.getWarningStatus() != null ? budget.getWarningStatus() : "NORMAL", false);
                document.add(budgetTable);
            } else {
                document.add(new Paragraph("No budget allocation registered for selected fiscal year.", BODY_FONT));
            }
            document.add(Chunk.NEWLINE);

            // Equipment Costs
            document.add(new Paragraph("3. Equipment Cost Breakdown", SECTION_FONT));
            document.add(Chunk.NEWLINE);
            List<CostAnalysisReportDto.EquipmentCostItemDto> eqCosts = report.getEquipmentCosts();
            if (eqCosts != null && !eqCosts.isEmpty()) {
                PdfPTable eqTable = createTable(
                        new String[]{"Equipment", "Laboratory", "Usage", "Maintenance", "Damage", "Total Cost"},
                        new float[]{2.2f, 1.8f, 1.2f, 1.2f, 1.2f, 1.4f}
                );
                for (CostAnalysisReportDto.EquipmentCostItemDto item : eqCosts) {
                    addTableCell(eqTable, item.getEquipmentName(), BODY_BOLD, Element.ALIGN_LEFT);
                    addTableCell(eqTable, item.getLaboratoryName() != null ? item.getLaboratoryName() : "-", BODY_FONT, Element.ALIGN_LEFT);
                    addTableCell(eqTable, formatMoney(item.getUsageCost()), BODY_FONT, Element.ALIGN_RIGHT);
                    addTableCell(eqTable, formatMoney(item.getMaintenanceCost()), BODY_FONT, Element.ALIGN_RIGHT);
                    addTableCell(eqTable, formatMoney(item.getDamageCharge()), BODY_FONT, Element.ALIGN_RIGHT);
                    addTableCell(eqTable, formatMoney(item.getTotalCost()), BODY_BOLD, Element.ALIGN_RIGHT);
                }
                document.add(eqTable);
            } else {
                document.add(new Paragraph("No equipment cost records available.", BODY_FONT));
            }
            document.add(Chunk.NEWLINE);

            // Department Comparison if present
            if (report.getDepartmentComparison() != null && !report.getDepartmentComparison().isEmpty()) {
                document.add(new Paragraph("4. Department Cost & Budget Comparison", SECTION_FONT));
                document.add(Chunk.NEWLINE);
                PdfPTable deptTable = createTable(
                        new String[]{"Department", "Total Cost", "Usage Cost", "Maintenance", "Allocated Budget", "Budget Util %"},
                        new float[]{2.2f, 1.3f, 1.2f, 1.2f, 1.4f, 1.3f}
                );
                for (CostAnalysisReportDto.DepartmentCostComparisonDto dept : report.getDepartmentComparison()) {
                    addTableCell(deptTable, dept.getDepartmentName(), BODY_BOLD, Element.ALIGN_LEFT);
                    addTableCell(deptTable, formatMoney(dept.getTotalCost()), BODY_BOLD, Element.ALIGN_RIGHT);
                    addTableCell(deptTable, formatMoney(dept.getUsageCost()), BODY_FONT, Element.ALIGN_RIGHT);
                    addTableCell(deptTable, formatMoney(dept.getMaintenanceCost()), BODY_FONT, Element.ALIGN_RIGHT);
                    addTableCell(deptTable, formatMoney(dept.getBudgetAllocated()), BODY_FONT, Element.ALIGN_RIGHT);
                    addTableCell(deptTable, String.format("%.1f%%", dept.getBudgetUtilizationPercentage() != null ? dept.getBudgetUtilizationPercentage().doubleValue() : 0.0), BODY_BOLD, Element.ALIGN_RIGHT);
                }
                document.add(deptTable);
            }

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Cost Analysis PDF report", e);
        }

        return out.toByteArray();
    }

    private void addMetadata(Document document, ReportMetadataDto meta) throws DocumentException {
        if (meta == null) return;
        StringBuilder sb = new StringBuilder();
        sb.append("Institution: ").append(meta.getInstitutionName() != null ? meta.getInstitutionName() : "N/A");
        if (meta.getDepartmentName() != null) sb.append(" | Department: ").append(meta.getDepartmentName());
        if (meta.getLaboratoryName() != null) sb.append(" | Lab: ").append(meta.getLaboratoryName());
        sb.append("\nDate Range: ").append(meta.getFrom() != null ? meta.getFrom() : "All time")
                .append(" to ").append(meta.getTo() != null ? meta.getTo() : "Present");
        if (meta.getGeneratedAt() != null) {
            sb.append("\nGenerated At: ").append(meta.getGeneratedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        sb.append(" | Generated By Role: ").append(meta.getGeneratedByRole() != null ? meta.getGeneratedByRole() : "User");
        document.add(new Paragraph(sb.toString(), SUBTITLE_FONT));
    }

    private PdfPTable createTable(String[] headers, float[] relativeWidths) throws DocumentException {
        PdfPTable table = new PdfPTable(headers.length);
        table.setWidthPercentage(100);
        if (relativeWidths != null) table.setWidths(relativeWidths);
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, HEADER_FONT));
            cell.setBackgroundColor(new Color(30, 58, 138)); // Dark Blue
            cell.setPadding(6);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }
        return table;
    }

    private void addTableRow(PdfPTable table, String label, String value, boolean isBold) {
        addTableCell(table, label, isBold ? BODY_BOLD : BODY_FONT, Element.ALIGN_LEFT);
        addTableCell(table, value, isBold ? BODY_BOLD : BODY_FONT, Element.ALIGN_RIGHT);
    }

    private void addTableCell(PdfPTable table, String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
        cell.setPadding(5);
        cell.setHorizontalAlignment(alignment);
        table.addCell(cell);
    }

    private String formatMoney(BigDecimal amount) {
        if (amount == null) return "₹0";
        return CURRENCY_FORMAT.format(amount);
    }
}
