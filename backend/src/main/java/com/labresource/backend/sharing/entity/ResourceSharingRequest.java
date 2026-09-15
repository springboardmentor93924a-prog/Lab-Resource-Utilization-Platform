package com.labresource.backend.sharing.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "ResourceSharingRequest")
@Getter
@Setter
@NoArgsConstructor
public class ResourceSharingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @Column(name = "requesting_institution_id", nullable = false)
    private Long requestingInstitutionId;

    @Column(name = "requesting_department_id")
    private Long requestingDepartmentId;

    @Column(name = "owning_institution_id", nullable = false)
    private Long owningInstitutionId;

    @Column(name = "owning_department_id")
    private Long owningDepartmentId;

    @Column(name = "equipment_id", nullable = false)
    private Long equipmentId;

    @Column(name = "requested_by", nullable = false)
    private Long requestedBy;

    @Column(name = "mou_status", length = 30)
    private String mouStatus = "PENDING"; // PENDING, MOU_PROPOSED, MOU_ACCEPTED, MOU_REJECTED, CANCELLED

    @Column(name = "mou_accepted_at")
    private LocalDateTime mouAcceptedAt;

    @Column(name = "cataloged_in_requesting_lab")
    private Boolean catalogedInRequestingLab = false;

    @Column(name = "requested_start_date", nullable = false)
    private LocalDate requestedStartDate;

    @Column(name = "requested_end_date", nullable = false)
    private LocalDate requestedEndDate;

    @Column(name = "purpose", columnDefinition = "text")
    private String purpose;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, MOU_PROPOSED, APPROVED, REJECTED, MOU_REJECTED, CANCELLED

    @Column(name = "rejection_reason", columnDefinition = "text")
    private String rejectionReason; // Set when Owning institution rejects initial request

    @Column(name = "mou_rejection_reason", columnDefinition = "text")
    private String mouRejectionReason; // Set when Requesting institution rejects proposed MOU

    @Column(name = "proposed_hourly_rate")
    private BigDecimal proposedHourlyRate; // Counter-proposed price per hour by Owning institution

    @Column(name = "mou_terms", columnDefinition = "text")
    private String mouTerms; // Proposed terms and conditions of MOU

    @Column(name = "available_start_time")
    private LocalTime availableStartTime; // Proposed daily availability window start

    @Column(name = "available_end_time")
    private LocalTime availableEndTime; // Proposed daily availability window end

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
