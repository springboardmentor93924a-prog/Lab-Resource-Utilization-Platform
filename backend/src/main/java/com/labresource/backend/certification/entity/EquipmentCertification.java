package com.labresource.backend.certification.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "EquipmentCertification")
@Getter
@Setter
@NoArgsConstructor
public class EquipmentCertification {

    public static final String VALID = "VALID";
    public static final String EXPIRING_SOON = "EXPIRING_SOON";
    public static final String EXPIRED = "EXPIRED";
    public static final String REVOKED = "REVOKED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "certification_id")
    private Long certificationId;

    @Column(name = "equipment_id", nullable = false)
    private Long equipmentId;

    @Column(name = "certificate_name", nullable = false, length = 150)
    private String certificateName;

    @Column(name = "certificate_number", length = 100)
    private String certificateNumber;

    @Column(name = "issued_by", length = 150)
    private String issuedBy;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "certificate_public_id", length = 500)
    private String certificatePublicId;

    @Column(name = "certificate_secure_url", length = 1000)
    private String certificateSecureUrl;

    @Column(name = "certificate_file_name", length = 255)
    private String certificateFileName;

    @Column(name = "certificate_content_type", length = 100)
    private String certificateContentType;

    @Column(name = "status", nullable = false, length = 20)
    private String status = VALID;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
