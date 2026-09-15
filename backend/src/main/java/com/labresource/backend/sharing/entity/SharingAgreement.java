package com.labresource.backend.sharing.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "SharingAgreement")
@Getter
@Setter
@NoArgsConstructor
public class SharingAgreement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "agreement_id")
    private Long agreementId;

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

    @Column(name = "status", nullable = false, length = 30)
    private String status = "ACTIVE"; // REQUESTED, APPROVED, REJECTED, ACTIVE, EXPIRED, CANCELLED

    @Column(name = "cost_sharing_terms", columnDefinition = "text")
    private String costSharingTerms;

    @Column(name = "mou_terms", columnDefinition = "text")
    private String mouTerms;

    @Column(name = "cataloged_in_requesting_lab")
    private Boolean catalogedInRequestingLab = false;

    @Column(name = "hourly_rate")
    private BigDecimal hourlyRate;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "approved_by")
    private Long approvedBy; // Owning Dept Head who created/proposed the MOU

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "terms_accepted_by")
    private Long termsAcceptedBy; // Requesting Dept Head who accepted MOU

    @Column(name = "terms_accepted_at")
    private LocalDateTime termsAcceptedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
