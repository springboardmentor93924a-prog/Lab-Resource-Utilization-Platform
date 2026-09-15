package com.labresource.backend.common.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.booking.entity.Booking;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.issuereport.entity.EquipmentIssueReport;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

@Service
public class ReceiptPdfGeneratorService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Generates a formal Booking Slip PDF / Text Receipt byte stream for student download.
     */
    public byte[] generateBookingReceiptPdf(Booking booking, Equipment equipment, AppUser user,
                                             Department department, Institution institution) {
        StringBuilder pdfText = new StringBuilder();
        pdfText.append("========================================================================\n");
        pdfText.append("                 LAB RESOURCE UTILIZATION PLATFORM                      \n");
        pdfText.append("                     OFFICIAL BOOKING RECEIPT                           \n");
        pdfText.append("========================================================================\n\n");

        pdfText.append("BOOKING METADATA:\n");
        pdfText.append("------------------------------------------------------------------------\n");
        pdfText.append("  Booking Reference ID : #").append(booking.getBookingId()).append("\n");
        pdfText.append("  Booking Status       : ").append(booking.getStatus()).append("\n");
        pdfText.append("  Payment Status       : ").append(booking.getPaymentStatus()).append("\n");
        pdfText.append("  Created At           : ").append(booking.getCreatedAt() != null ? booking.getCreatedAt().format(DATE_FORMATTER) : "N/A").append("\n\n");

        pdfText.append("EQUIPMENT & LAB DETAILS:\n");
        pdfText.append("------------------------------------------------------------------------\n");
        pdfText.append("  Equipment Name       : ").append(equipment != null ? equipment.getName() : "N/A").append("\n");
        pdfText.append("  Category             : ").append(equipment != null ? equipment.getCategory() : "N/A").append("\n");
        pdfText.append("  Serial Number        : ").append(equipment != null ? equipment.getSerialNumber() : "N/A").append("\n");
        pdfText.append("  Location             : ").append(equipment != null ? equipment.getLocation() : "N/A").append("\n");
        pdfText.append("  Department           : ").append(department != null ? department.getName() : "N/A").append("\n");
        pdfText.append("  Institution          : ").append(institution != null ? institution.getName() : "N/A").append("\n\n");

        pdfText.append("SCHEDULE & FINANCIALS:\n");
        pdfText.append("------------------------------------------------------------------------\n");
        pdfText.append("  Start Time           : ").append(booking.getStartTime().format(DATE_FORMATTER)).append("\n");
        pdfText.append("  End Time             : ").append(booking.getEndTime().format(DATE_FORMATTER)).append("\n");
        pdfText.append("  Purpose / Project    : ").append(booking.getPurpose() != null ? booking.getPurpose() : "N/A").append("\n");
        pdfText.append("  Estimated Cost       : INR ").append(booking.getEstimatedCost() != null ? booking.getEstimatedCost() : "0.00").append("\n");
        pdfText.append("  Actual Cost          : INR ").append(booking.getActualCost() != null ? booking.getActualCost() : "0.00").append("\n\n");

        pdfText.append("USER / RESEARCHER DETAILS:\n");
        pdfText.append("------------------------------------------------------------------------\n");
        pdfText.append("  Researcher Name      : ").append(user != null ? (user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")).trim() : "N/A").append("\n");
        pdfText.append("  Email                : ").append(user != null ? user.getEmail() : "N/A").append("\n\n");

        pdfText.append("TERMS & CONDITIONS:\n");
        pdfText.append("------------------------------------------------------------------------\n");
        pdfText.append("  1. Present this booking receipt to the lab manager prior to session.\n");
        pdfText.append("  2. Ensure safety guidelines and operational procedures are adhered to.\n");
        pdfText.append("  3. Report any machine faults or damage immediately.\n\n");

        pdfText.append("========================================================================\n");
        pdfText.append("          SYSTEM GENERATED DOCUMENT - NO SIGNATURE REQUIRED             \n");
        pdfText.append("========================================================================\n");

        return pdfText.toString().getBytes(StandardCharsets.UTF_8);
    }

    /**
     * Generates an Incident Report Slip PDF / Text Receipt byte stream for student download.
     */
    public byte[] generateIssueReportReceiptPdf(EquipmentIssueReport report, Booking booking,
                                                Equipment equipment, AppUser user, Department department) {
        StringBuilder pdfText = new StringBuilder();
        pdfText.append("========================================================================\n");
        pdfText.append("                 LAB RESOURCE UTILIZATION PLATFORM                      \n");
        pdfText.append("                   EQUIPMENT INCIDENT SLIP                              \n");
        pdfText.append("========================================================================\n\n");

        pdfText.append("INCIDENT METADATA:\n");
        pdfText.append("------------------------------------------------------------------------\n");
        pdfText.append("  Issue Report ID      : #").append(report.getIssueReportId()).append("\n");
        pdfText.append("  Linked Booking ID    : #").append(report.getBookingId()).append("\n");
        pdfText.append("  Report Status        : ").append(report.getStatus()).append("\n");
        pdfText.append("  Priority Level       : ").append(report.getPriority()).append("\n");
        pdfText.append("  Reported Date & Time : ").append(report.getCreatedAt() != null ? report.getCreatedAt().format(DATE_FORMATTER) : "N/A").append("\n\n");

        pdfText.append("INCIDENT DETAILS & ACKNOWLEDGMENT:\n");
        pdfText.append("------------------------------------------------------------------------\n");
        pdfText.append("  Issue Type           : ").append(report.getIssueType() != null ? report.getIssueType() : "N/A").append("\n");
        pdfText.append("  Incident Timestamp   : ").append(report.getIncidentTimestamp() != null ? report.getIncidentTimestamp().format(DATE_FORMATTER) : "N/A").append("\n");
        pdfText.append("  Damage Acknowledged  : ").append(Boolean.TRUE.equals(report.getDamageAcknowledged()) ? "YES (Confirmed by user)" : "NO").append("\n");
        pdfText.append("  Description          : ").append(report.getIssueDescription()).append("\n\n");

        pdfText.append("EQUIPMENT & LOCATION:\n");
        pdfText.append("------------------------------------------------------------------------\n");
        pdfText.append("  Equipment Name       : ").append(equipment != null ? equipment.getName() : "N/A").append("\n");
        pdfText.append("  Serial Number        : ").append(equipment != null ? equipment.getSerialNumber() : "N/A").append("\n");
        pdfText.append("  Location             : ").append(equipment != null ? equipment.getLocation() : "N/A").append("\n");
        pdfText.append("  Department           : ").append(department != null ? department.getName() : "N/A").append("\n\n");

        pdfText.append("REPORTER INFORMATION:\n");
        pdfText.append("------------------------------------------------------------------------\n");
        pdfText.append("  Reported By          : ").append(user != null ? (user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")).trim() : "N/A").append("\n");
        pdfText.append("  Email                : ").append(user != null ? user.getEmail() : "N/A").append("\n\n");

        if (report.getResolutionNotes() != null) {
            pdfText.append("RESOLUTION NOTES:\n");
            pdfText.append("------------------------------------------------------------------------\n");
            pdfText.append("  Resolution           : ").append(report.getResolutionNotes()).append("\n");
            pdfText.append("  Resolved At          : ").append(report.getResolvedAt() != null ? report.getResolvedAt().format(DATE_FORMATTER) : "N/A").append("\n\n");
        }

        pdfText.append("========================================================================\n");
        pdfText.append("          SYSTEM GENERATED INCIDENT RECEIPT                             \n");
        pdfText.append("========================================================================\n");

        return pdfText.toString().getBytes(StandardCharsets.UTF_8);
    }
}
