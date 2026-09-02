package com.example.lab_platform.util;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Reusable PDF/Excel export used by every Task 5 report. Each report
 * builds its own headers/rows/summary and hands them here rather than
 * every report re-implementing document formatting from scratch.
 */
public final class ReportExportUtil {

    private static final DateTimeFormatter TIMESTAMP_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    private ReportExportUtil() {
    }

    public static byte[] generatePdf(
            String title,
            LocalDateTime generatedAt,
            Map<String, String> filters,
            List<String[]> summaryLines,
            String[] headers,
            List<String[]> rows) {

        try {
            Document document = new Document(PageSize.A4.rotate(), 24, 24, 24, 24);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.DARK_GRAY);
            Font metaFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY);
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.BLACK);
            Font summaryFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);

            Paragraph titleParagraph = new Paragraph(title, titleFont);
            titleParagraph.setSpacingAfter(4f);
            document.add(titleParagraph);

            Paragraph generated = new Paragraph(
                    "Generated: " + (generatedAt != null ? generatedAt.format(TIMESTAMP_FORMAT) : "N/A"),
                    metaFont);
            generated.setSpacingAfter(2f);
            document.add(generated);

            if (filters != null && !filters.isEmpty()) {
                StringBuilder filterLine = new StringBuilder("Filters applied: ");
                filters.forEach((k, v) -> filterLine.append(k).append("=").append(v).append("  "));
                Paragraph filterParagraph = new Paragraph(filterLine.toString(), metaFont);
                filterParagraph.setSpacingAfter(10f);
                document.add(filterParagraph);
            }

            if (summaryLines != null && !summaryLines.isEmpty()) {
                Paragraph summaryHeading = new Paragraph("Summary", sectionFont);
                summaryHeading.setSpacingAfter(4f);
                document.add(summaryHeading);

                for (String[] line : summaryLines) {
                    Paragraph p = new Paragraph(line[0] + ": " + line[1], summaryFont);
                    document.add(p);
                }

                Paragraph spacer = new Paragraph(" ");
                spacer.setSpacingAfter(6f);
                document.add(spacer);
            }

            if (headers != null && headers.length > 0) {

                PdfPTable table = new PdfPTable(headers.length);
                table.setWidthPercentage(100);

                for (String header : headers) {
                    PdfPCell cell = new PdfPCell(new com.lowagie.text.Phrase(header, headerFont));
                    cell.setBackgroundColor(new Color(79, 70, 229)); // matches frontend accent color
                    cell.setHorizontalAlignment(Element.ALIGN_LEFT);
                    cell.setPadding(5f);
                    table.addCell(cell);
                }

                if (rows == null || rows.isEmpty()) {
                    PdfPCell empty = new PdfPCell(new com.lowagie.text.Phrase(
                            "No data available for the selected filters.", cellFont));
                    empty.setColspan(headers.length);
                    empty.setPadding(8f);
                    table.addCell(empty);
                } else {
                    for (String[] row : rows) {
                        for (String value : row) {
                            PdfPCell cell = new PdfPCell(new com.lowagie.text.Phrase(
                                    value != null ? value : "-", cellFont));
                            cell.setPadding(4f);
                            table.addCell(cell);
                        }
                    }
                }

                document.add(table);
            }

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report: " + e.getMessage(), e);
        }
    }

    public static byte[] generateExcel(
            String title,
            LocalDateTime generatedAt,
            Map<String, String> filters,
            List<String[]> summaryLines,
            String[] headers,
            List<String[]> rows) {

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Report");

            CellStyle titleStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);

            CellStyle metaStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font metaFont = workbook.createFont();
            metaFont.setItalic(true);
            metaFont.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
            metaStyle.setFont(metaFont);

            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.INDIGO.getIndex());
            headerStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);

            CellStyle boldStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            boldStyle.setFont(boldFont);

            int rowIndex = 0;

            Row titleRow = sheet.createRow(rowIndex++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(title);
            titleCell.setCellStyle(titleStyle);

            Row generatedRow = sheet.createRow(rowIndex++);
            Cell generatedCell = generatedRow.createCell(0);
            generatedCell.setCellValue("Generated: "
                    + (generatedAt != null ? generatedAt.format(TIMESTAMP_FORMAT) : "N/A"));
            generatedCell.setCellStyle(metaStyle);

            if (filters != null && !filters.isEmpty()) {
                StringBuilder filterLine = new StringBuilder("Filters applied: ");
                filters.forEach((k, v) -> filterLine.append(k).append("=").append(v).append("  "));
                Row filterRow = sheet.createRow(rowIndex++);
                Cell filterCell = filterRow.createCell(0);
                filterCell.setCellValue(filterLine.toString());
                filterCell.setCellStyle(metaStyle);
            }

            rowIndex++; // blank spacer row

            if (summaryLines != null && !summaryLines.isEmpty()) {

                Row summaryHeading = sheet.createRow(rowIndex++);
                Cell summaryHeadingCell = summaryHeading.createCell(0);
                summaryHeadingCell.setCellValue("Summary");
                summaryHeadingCell.setCellStyle(boldStyle);

                for (String[] line : summaryLines) {
                    Row summaryRow = sheet.createRow(rowIndex++);
                    summaryRow.createCell(0).setCellValue(line[0]);
                    summaryRow.createCell(1).setCellValue(line[1]);
                }

                rowIndex++; // blank spacer row
            }

            if (headers != null && headers.length > 0) {

                Row headerRow = sheet.createRow(rowIndex++);
                for (int col = 0; col < headers.length; col++) {
                    Cell cell = headerRow.createCell(col);
                    cell.setCellValue(headers[col]);
                    cell.setCellStyle(headerStyle);
                }

                if (rows == null || rows.isEmpty()) {
                    Row emptyRow = sheet.createRow(rowIndex++);
                    emptyRow.createCell(0).setCellValue("No data available for the selected filters.");
                } else {
                    for (String[] rowValues : rows) {
                        Row dataRow = sheet.createRow(rowIndex++);
                        for (int col = 0; col < rowValues.length; col++) {
                            dataRow.createCell(col).setCellValue(
                                    rowValues[col] != null ? rowValues[col] : "-");
                        }
                    }
                }

                for (int col = 0; col < headers.length; col++) {
                    sheet.autoSizeColumn(col);
                    // autoSizeColumn can under-size on headless/servers without
                    // fonts installed - enforce a sane minimum width too.
                    if (sheet.getColumnWidth(col) < 3000) {
                        sheet.setColumnWidth(col, 3500);
                    }
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel report: " + e.getMessage(), e);
        }
    }
}
