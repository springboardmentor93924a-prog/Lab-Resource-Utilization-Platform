package com.labresource.backend.report.service;

import com.labresource.backend.report.dto.CostAnalysisReportDto;
import com.labresource.backend.report.dto.ReportMetadataDto;
import com.labresource.backend.report.dto.UtilizationEffectivenessReportDto;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportExcelExportService {

    public byte[] exportUtilizationExcel(UtilizationEffectivenessReportDto report) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle boldStyle = createBoldStyle(workbook);
            CellStyle numStyle = createNumberStyle(workbook, "0.0");
            CellStyle pctStyle = createNumberStyle(workbook, "0.0\"%\"");

            // 1. Report Summary Sheet
            Sheet summarySheet = workbook.createSheet("Report Summary");
            int rowIdx = 0;
            rowIdx = addMetadataRows(summarySheet, report.getMetadata(), headerStyle, boldStyle, rowIdx);
            rowIdx++;

            Row sumHeaderRow = summarySheet.createRow(rowIdx++);
            createCell(sumHeaderRow, 0, "Utilization Summary Metric", headerStyle);
            createCell(sumHeaderRow, 1, "Value", headerStyle);

            UtilizationEffectivenessReportDto.UtilizationSummaryDto summary = report.getSummary();
            if (summary != null) {
                addSummaryRow(summarySheet, rowIdx++, "Average Utilization Percentage", String.format("%.1f%%", summary.getAverageUtilizationPercentage() != null ? summary.getAverageUtilizationPercentage() : 0.0), boldStyle);
                addSummaryRow(summarySheet, rowIdx++, "Total Used Hours", String.format("%.1f hrs", summary.getTotalUsedHours() != null ? summary.getTotalUsedHours() : 0.0), null);
                addSummaryRow(summarySheet, rowIdx++, "Total Available Hours", String.format("%.1f hrs", summary.getTotalAvailableHours() != null ? summary.getTotalAvailableHours() : 0.0), null);
                addSummaryRow(summarySheet, rowIdx++, "Total Idle Hours", String.format("%.1f hrs", summary.getTotalIdleHours() != null ? summary.getTotalIdleHours() : 0.0), null);
                addSummaryRow(summarySheet, rowIdx++, "Total Equipment Count", String.valueOf(summary.getTotalEquipmentCount() != null ? summary.getTotalEquipmentCount() : 0), null);
                addSummaryRow(summarySheet, rowIdx++, "Total Laboratory Count", String.valueOf(summary.getTotalLaboratoryCount() != null ? summary.getTotalLaboratoryCount() : 0), null);
                addSummaryRow(summarySheet, rowIdx++, "Total Booking Count", String.valueOf(summary.getTotalBookingCount() != null ? summary.getTotalBookingCount() : 0), null);
            }
            summarySheet.autoSizeColumn(0);
            summarySheet.autoSizeColumn(1);

            // 2. Equipment Utilization Sheet
            Sheet eqSheet = workbook.createSheet("Equipment Utilization");
            Row eqHeader = eqSheet.createRow(0);
            String[] eqCols = {"Equipment ID", "Equipment Name", "Laboratory", "Department", "Used Hours", "Available Hours", "Idle Hours", "Utilization %", "Booking Count", "Status"};
            for (int i = 0; i < eqCols.length; i++) {
                createCell(eqHeader, i, eqCols[i], headerStyle);
            }
            eqSheet.createFreezePane(0, 1);

            List<UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto> eqList = report.getEquipmentUtilization();
            if (eqList != null) {
                int r = 1;
                for (UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto item : eqList) {
                    Row row = eqSheet.createRow(r++);
                    createCell(row, 0, String.valueOf(item.getEquipmentId()), null);
                    createCell(row, 1, item.getEquipmentName(), boldStyle);
                    createCell(row, 2, item.getLaboratoryName(), null);
                    createCell(row, 3, item.getDepartmentName(), null);
                    createNumericCell(row, 4, item.getUsedHours(), numStyle);
                    createNumericCell(row, 5, item.getAvailableHours(), numStyle);
                    createNumericCell(row, 6, item.getIdleHours(), numStyle);
                    createNumericCell(row, 7, item.getUtilizationPercentage(), pctStyle);
                    createNumericCell(row, 8, item.getBookingCount() != null ? item.getBookingCount().doubleValue() : 0, null);
                    createCell(row, 9, item.getUtilizationStatus(), null);
                }
            }
            autoSizeColumns(eqSheet, eqCols.length);

            // 3. Utilization Trend Sheet
            Sheet trendSheet = workbook.createSheet("Utilization Trend");
            Row trendHeader = trendSheet.createRow(0);
            String[] trendCols = {"Period", "Used Hours", "Available Hours", "Idle Hours", "Utilization %"};
            for (int i = 0; i < trendCols.length; i++) {
                createCell(trendHeader, i, trendCols[i], headerStyle);
            }
            trendSheet.createFreezePane(0, 1);
            if (report.getUtilizationTrend() != null) {
                int r = 1;
                for (UtilizationEffectivenessReportDto.UtilizationTrendPointDto pt : report.getUtilizationTrend()) {
                    Row row = trendSheet.createRow(r++);
                    createCell(row, 0, pt.getPeriod(), boldStyle);
                    createNumericCell(row, 1, pt.getUsedHours(), numStyle);
                    createNumericCell(row, 2, pt.getAvailableHours(), numStyle);
                    createNumericCell(row, 3, pt.getIdleHours(), numStyle);
                    createNumericCell(row, 4, pt.getUtilizationPercentage(), pctStyle);
                }
            }
            autoSizeColumns(trendSheet, trendCols.length);

            // 4. Underutilized Equipment Sheet
            Sheet underSheet = workbook.createSheet("Underutilized Equipment");
            Row underHeader = underSheet.createRow(0);
            for (int i = 0; i < eqCols.length; i++) {
                createCell(underHeader, i, eqCols[i], headerStyle);
            }
            if (report.getUnderutilizedEquipment() != null) {
                int r = 1;
                for (UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto item : report.getUnderutilizedEquipment()) {
                    Row row = underSheet.createRow(r++);
                    createCell(row, 0, String.valueOf(item.getEquipmentId()), null);
                    createCell(row, 1, item.getEquipmentName(), boldStyle);
                    createCell(row, 2, item.getLaboratoryName(), null);
                    createCell(row, 3, item.getDepartmentName(), null);
                    createNumericCell(row, 4, item.getUsedHours(), numStyle);
                    createNumericCell(row, 5, item.getAvailableHours(), numStyle);
                    createNumericCell(row, 6, item.getIdleHours(), numStyle);
                    createNumericCell(row, 7, item.getUtilizationPercentage(), pctStyle);
                    createNumericCell(row, 8, item.getBookingCount() != null ? item.getBookingCount().doubleValue() : 0, null);
                    createCell(row, 9, item.getUtilizationStatus(), null);
                }
            }
            autoSizeColumns(underSheet, eqCols.length);

            // 5. Highly Utilized Equipment Sheet
            Sheet highSheet = workbook.createSheet("Highly Utilized Equipment");
            Row highHeader = highSheet.createRow(0);
            for (int i = 0; i < eqCols.length; i++) {
                createCell(highHeader, i, eqCols[i], headerStyle);
            }
            if (report.getHighlyUtilizedEquipment() != null) {
                int r = 1;
                for (UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto item : report.getHighlyUtilizedEquipment()) {
                    Row row = highSheet.createRow(r++);
                    createCell(row, 0, String.valueOf(item.getEquipmentId()), null);
                    createCell(row, 1, item.getEquipmentName(), boldStyle);
                    createCell(row, 2, item.getLaboratoryName(), null);
                    createCell(row, 3, item.getDepartmentName(), null);
                    createNumericCell(row, 4, item.getUsedHours(), numStyle);
                    createNumericCell(row, 5, item.getAvailableHours(), numStyle);
                    createNumericCell(row, 6, item.getIdleHours(), numStyle);
                    createNumericCell(row, 7, item.getUtilizationPercentage(), pctStyle);
                    createNumericCell(row, 8, item.getBookingCount() != null ? item.getBookingCount().doubleValue() : 0, null);
                    createCell(row, 9, item.getUtilizationStatus(), null);
                }
            }
            autoSizeColumns(highSheet, eqCols.length);

            // 6. Department Comparison Sheet (if present for Institution Admin)
            if (report.getDepartmentComparison() != null && !report.getDepartmentComparison().isEmpty()) {
                Sheet deptSheet = workbook.createSheet("Department Comparison");
                Row deptHeader = deptSheet.createRow(0);
                String[] deptCols = {"Department ID", "Department Name", "Equipment Count", "Laboratory Count", "Used Hours", "Available Hours", "Utilization %"};
                for (int i = 0; i < deptCols.length; i++) {
                    createCell(deptHeader, i, deptCols[i], headerStyle);
                }
                deptSheet.createFreezePane(0, 1);
                int r = 1;
                for (UtilizationEffectivenessReportDto.DepartmentUtilizationComparisonDto dept : report.getDepartmentComparison()) {
                    Row row = deptSheet.createRow(r++);
                    createCell(row, 0, String.valueOf(dept.getDepartmentId()), null);
                    createCell(row, 1, dept.getDepartmentName(), boldStyle);
                    createNumericCell(row, 2, dept.getEquipmentCount() != null ? dept.getEquipmentCount().doubleValue() : 0, null);
                    createNumericCell(row, 3, dept.getLaboratoryCount() != null ? dept.getLaboratoryCount().doubleValue() : 0, null);
                    createNumericCell(row, 4, dept.getUsedHours(), numStyle);
                    createNumericCell(row, 5, dept.getAvailableHours(), numStyle);
                    createNumericCell(row, 6, dept.getUtilizationPercentage(), pctStyle);
                }
                autoSizeColumns(deptSheet, deptCols.length);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Utilization Excel report", e);
        }
    }

    public byte[] exportCostExcel(CostAnalysisReportDto report) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle boldStyle = createBoldStyle(workbook);
            CellStyle currencyStyle = createNumberStyle(workbook, "₹#,##0");
            CellStyle pctStyle = createNumberStyle(workbook, "0.0\"%\"");

            // 1. Report Summary Sheet
            Sheet summarySheet = workbook.createSheet("Report Summary");
            int rowIdx = 0;
            rowIdx = addMetadataRows(summarySheet, report.getMetadata(), headerStyle, boldStyle, rowIdx);
            rowIdx++;

            Row sumHeaderRow = summarySheet.createRow(rowIdx++);
            createCell(sumHeaderRow, 0, "Financial Summary Category", headerStyle);
            createCell(sumHeaderRow, 1, "Amount / Value", headerStyle);

            CostAnalysisReportDto.CostSummaryBreakdownDto summary = report.getSummary();
            if (summary != null) {
                addSummaryRow(summarySheet, rowIdx++, "Total Cost Amount", formatMoney(summary.getTotalCost()), boldStyle);
                addSummaryRow(summarySheet, rowIdx++, "Equipment Usage Cost", formatMoney(summary.getUsageCost()), null);
                addSummaryRow(summarySheet, rowIdx++, "Maintenance Expense", formatMoney(summary.getMaintenanceCost()), null);
                addSummaryRow(summarySheet, rowIdx++, "Resource Sharing Fee", formatMoney(summary.getSharingFee()), null);
                addSummaryRow(summarySheet, rowIdx++, "Damage Charge Penalties", formatMoney(summary.getDamageCharge()), null);
                addSummaryRow(summarySheet, rowIdx++, "Total Cost Records", String.valueOf(summary.getTotalCostsCount() != null ? summary.getTotalCostsCount() : 0), null);
            }
            summarySheet.autoSizeColumn(0);
            summarySheet.autoSizeColumn(1);

            // 2. Budget Sheet
            Sheet budgetSheet = workbook.createSheet("Budget Audit");
            Row bHeader = budgetSheet.createRow(0);
            createCell(bHeader, 0, "Budget Metric", headerStyle);
            createCell(bHeader, 1, "Value", headerStyle);

            CostAnalysisReportDto.BudgetReportSummaryDto budget = report.getBudget();
            if (budget != null) {
                int r = 1;
                addSummaryRow(budgetSheet, r++, "Fiscal Year", budget.getFiscalYear(), boldStyle);
                addSummaryRow(budgetSheet, r++, "Allocated Budget", formatMoney(budget.getAllocatedAmount()), null);
                addSummaryRow(budgetSheet, r++, "Used Amount", formatMoney(budget.getUsedAmount()), null);
                addSummaryRow(budgetSheet, r++, "Remaining Balance", formatMoney(budget.getRemainingAmount()), null);
                addSummaryRow(budgetSheet, r++, "Consumption Rate", String.format("%.1f%%", budget.getUsedPercentage() != null ? budget.getUsedPercentage().doubleValue() : 0.0), boldStyle);
                addSummaryRow(budgetSheet, r++, "Budget Warning Status", budget.getWarningStatus(), null);
            }
            budgetSheet.autoSizeColumn(0);
            budgetSheet.autoSizeColumn(1);

            // 3. Equipment Costs Sheet
            Sheet eqCostsSheet = workbook.createSheet("Equipment Costs");
            Row eqHeader = eqCostsSheet.createRow(0);
            String[] eqCols = {"Equipment ID", "Equipment Name", "Laboratory", "Department", "Usage Cost", "Maintenance Cost", "Damage Charge", "Total Cost"};
            for (int i = 0; i < eqCols.length; i++) {
                createCell(eqHeader, i, eqCols[i], headerStyle);
            }
            eqCostsSheet.createFreezePane(0, 1);

            List<CostAnalysisReportDto.EquipmentCostItemDto> eqCosts = report.getEquipmentCosts();
            if (eqCosts != null) {
                int r = 1;
                for (CostAnalysisReportDto.EquipmentCostItemDto item : eqCosts) {
                    Row row = eqCostsSheet.createRow(r++);
                    createCell(row, 0, String.valueOf(item.getEquipmentId()), null);
                    createCell(row, 1, item.getEquipmentName(), boldStyle);
                    createCell(row, 2, item.getLaboratoryName(), null);
                    createCell(row, 3, item.getDepartmentName(), null);
                    createNumericCell(row, 4, toDouble(item.getUsageCost()), currencyStyle);
                    createNumericCell(row, 5, toDouble(item.getMaintenanceCost()), currencyStyle);
                    createNumericCell(row, 6, toDouble(item.getDamageCharge()), currencyStyle);
                    createNumericCell(row, 7, toDouble(item.getTotalCost()), currencyStyle);
                }
            }
            autoSizeColumns(eqCostsSheet, eqCols.length);

            // 4. Laboratory Costs Sheet
            Sheet labCostsSheet = workbook.createSheet("Laboratory Costs");
            Row labHeader = labCostsSheet.createRow(0);
            String[] labCols = {"Laboratory ID", "Laboratory Name", "Department", "Usage Cost", "Maintenance Cost", "Damage Charge", "Total Cost"};
            for (int i = 0; i < labCols.length; i++) {
                createCell(labHeader, i, labCols[i], headerStyle);
            }
            labCostsSheet.createFreezePane(0, 1);
            if (report.getLaboratoryCosts() != null) {
                int r = 1;
                for (CostAnalysisReportDto.LaboratoryCostItemDto lab : report.getLaboratoryCosts()) {
                    Row row = labCostsSheet.createRow(r++);
                    createCell(row, 0, String.valueOf(lab.getLaboratoryId()), null);
                    createCell(row, 1, lab.getLaboratoryName(), boldStyle);
                    createCell(row, 2, lab.getDepartmentName(), null);
                    createNumericCell(row, 3, toDouble(lab.getUsageCost()), currencyStyle);
                    createNumericCell(row, 4, toDouble(lab.getMaintenanceCost()), currencyStyle);
                    createNumericCell(row, 5, toDouble(lab.getDamageCharge()), currencyStyle);
                    createNumericCell(row, 6, toDouble(lab.getTotalCost()), currencyStyle);
                }
            }
            autoSizeColumns(labCostsSheet, labCols.length);

            // 5. Maintenance Costs Sheet
            Sheet maintSheet = workbook.createSheet("Maintenance Costs");
            Row mHeader = maintSheet.createRow(0);
            String[] mCols = {"Maintenance ID", "Equipment Name", "Laboratory", "Created Date", "Cost Amount", "Status"};
            for (int i = 0; i < mCols.length; i++) {
                createCell(mHeader, i, mCols[i], headerStyle);
            }
            maintSheet.createFreezePane(0, 1);
            if (report.getMaintenanceCosts() != null) {
                int r = 1;
                for (CostAnalysisReportDto.MaintenanceCostItemDto m : report.getMaintenanceCosts()) {
                    Row row = maintSheet.createRow(r++);
                    createCell(row, 0, "WO-#" + m.getMaintenanceId(), boldStyle);
                    createCell(row, 1, m.getEquipmentName(), null);
                    createCell(row, 2, m.getLaboratoryName(), null);
                    createCell(row, 3, m.getCreatedDate() != null ? m.getCreatedDate().toString() : "-", null);
                    createNumericCell(row, 4, toDouble(m.getMaintenanceCost()), currencyStyle);
                    createCell(row, 5, m.getStatus(), null);
                }
            }
            autoSizeColumns(maintSheet, mCols.length);

            // 6. Department Comparison Sheet (if present for Institution Admin)
            if (report.getDepartmentComparison() != null && !report.getDepartmentComparison().isEmpty()) {
                Sheet deptSheet = workbook.createSheet("Department Comparison");
                Row deptHeader = deptSheet.createRow(0);
                String[] deptCols = {"Department ID", "Department Name", "Total Cost", "Usage Cost", "Maintenance Cost", "Allocated Budget", "Budget Used", "Budget Util %"};
                for (int i = 0; i < deptCols.length; i++) {
                    createCell(deptHeader, i, deptCols[i], headerStyle);
                }
                deptSheet.createFreezePane(0, 1);
                int r = 1;
                for (CostAnalysisReportDto.DepartmentCostComparisonDto dept : report.getDepartmentComparison()) {
                    Row row = deptSheet.createRow(r++);
                    createCell(row, 0, String.valueOf(dept.getDepartmentId()), null);
                    createCell(row, 1, dept.getDepartmentName(), boldStyle);
                    createNumericCell(row, 2, toDouble(dept.getTotalCost()), currencyStyle);
                    createNumericCell(row, 3, toDouble(dept.getUsageCost()), currencyStyle);
                    createNumericCell(row, 4, toDouble(dept.getMaintenanceCost()), currencyStyle);
                    createNumericCell(row, 5, toDouble(dept.getBudgetAllocated()), currencyStyle);
                    createNumericCell(row, 6, toDouble(dept.getBudgetUsed()), currencyStyle);
                    createNumericCell(row, 7, toDouble(dept.getBudgetUtilizationPercentage()), pctStyle);
                }
                autoSizeColumns(deptSheet, deptCols.length);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Cost Analysis Excel report", e);
        }
    }

    private int addMetadataRows(Sheet sheet, ReportMetadataDto meta, CellStyle headerStyle, CellStyle boldStyle, int startRow) {
        if (meta == null) return startRow;
        Row r0 = sheet.createRow(startRow++);
        createCell(r0, 0, "Report Type", headerStyle);
        createCell(r0, 1, meta.getReportType(), boldStyle);

        Row r1 = sheet.createRow(startRow++);
        createCell(r1, 0, "Institution", headerStyle);
        createCell(r1, 1, meta.getInstitutionName(), null);

        if (meta.getDepartmentName() != null) {
            Row r2 = sheet.createRow(startRow++);
            createCell(r2, 0, "Department", headerStyle);
            createCell(r2, 1, meta.getDepartmentName(), null);
        }
        if (meta.getLaboratoryName() != null) {
            Row r3 = sheet.createRow(startRow++);
            createCell(r3, 0, "Laboratory", headerStyle);
            createCell(r3, 1, meta.getLaboratoryName(), null);
        }

        Row r4 = sheet.createRow(startRow++);
        createCell(r4, 0, "Date Scope", headerStyle);
        createCell(r4, 1, (meta.getFrom() != null ? meta.getFrom().toString() : "All") + " to " + (meta.getTo() != null ? meta.getTo().toString() : "Present"), null);

        Row r5 = sheet.createRow(startRow++);
        createCell(r5, 0, "Generated At", headerStyle);
        createCell(r5, 1, meta.getGeneratedAt() != null ? meta.getGeneratedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "-", null);

        Row r6 = sheet.createRow(startRow++);
        createCell(r6, 0, "Generated By Role", headerStyle);
        createCell(r6, 1, meta.getGeneratedByRole(), null);

        return startRow;
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle createBoldStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private CellStyle createNumberStyle(Workbook workbook, String format) {
        CellStyle style = workbook.createCellStyle();
        DataFormat dataFormat = workbook.createDataFormat();
        style.setDataFormat(dataFormat.getFormat(format));
        return style;
    }

    private void createCell(Row row, int colIndex, String value, CellStyle style) {
        Cell cell = row.createCell(colIndex);
        cell.setCellValue(value != null ? value : "-");
        if (style != null) cell.setCellStyle(style);
    }

    private void createNumericCell(Row row, int colIndex, Double value, CellStyle style) {
        Cell cell = row.createCell(colIndex);
        if (value != null) {
            cell.setCellValue(value);
        } else {
            cell.setCellValue(0.0);
        }
        if (style != null) cell.setCellStyle(style);
    }

    private void addSummaryRow(Sheet sheet, int rowIdx, String label, String value, CellStyle style) {
        Row row = sheet.createRow(rowIdx);
        createCell(row, 0, label, style);
        createCell(row, 1, value, style);
    }

    private void autoSizeColumns(Sheet sheet, int numCols) {
        for (int i = 0; i < numCols; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private String formatMoney(BigDecimal amount) {
        if (amount == null) return "₹0";
        return "₹" + amount.setScale(0, java.math.RoundingMode.HALF_UP).toString();
    }

    private Double toDouble(BigDecimal val) {
        return val != null ? val.doubleValue() : 0.0;
    }
}
