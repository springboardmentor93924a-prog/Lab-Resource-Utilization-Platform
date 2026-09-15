package com.labresource.backend.sharing.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Detailed DTO for Department Heads & Institution Admins to view full details
 * of an inter-institution sharing request, agreement, equipment metadata,
 * MOU counter-proposals, and rejection reasons.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SharingAgreementDetailDto {

    // ── Request Identity & Status ─────────────────────────────────────────────
    private Long requestId;
    private Long agreementId; // Null if request not yet approved into an active agreement
    private String status;     // PENDING, MOU_PROPOSED, APPROVED, REJECTED, MOU_REJECTED, ACTIVE, EXPIRED, CANCELLED

    // ── Equipment Details ─────────────────────────────────────────────────────
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCategory;
    private String equipmentSerialNumber;
    private String equipmentLocation;
    private BigDecimal internalHourlyRate;
    private BigDecimal externalHourlyRate;

    // ── Institutions & Departments ────────────────────────────────────────────
    private Long owningInstitutionId;
    private String owningInstitutionName;
    private Long owningDepartmentId;
    private String owningDepartmentName;

    private Long requestingInstitutionId;
    private String requestingInstitutionName;
    private Long requestingDepartmentId;
    private String requestingDepartmentName;
    private Boolean catalogedInRequestingLab = false;

    // ── Dates & Purpose ───────────────────────────────────────────────────────
    private LocalDate requestedStartDate;
    private LocalDate requestedEndDate;
    private String purpose;

    // ── MOU Counter-Proposal Details ─────────────────────────────────────────
    private BigDecimal proposedHourlyRate;
    private String mouTerms;
    private LocalTime availableStartTime;
    private LocalTime availableEndTime;

    // ── Two-Way Rejection Details ─────────────────────────────────────────────
    private String rejectionReason;     // Owning institution rejection reason
    private String mouRejectionReason;  // Requesting institution MOU rejection reason

    // ── User Identity & Signatures ────────────────────────────────────────────
    private Long requestedByUserId;
    private String requestedByUserName;

    private Long reviewedByUserId;
    private String reviewedByUserName;

    private Long termsAcceptedByUserId;
    private String termsAcceptedByUserName;

    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime termsAcceptedAt;
}
