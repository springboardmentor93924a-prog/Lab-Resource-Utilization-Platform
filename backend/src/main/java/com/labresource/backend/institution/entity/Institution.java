package com.labresource.backend.institution.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Institution")
@Getter
@Setter
@NoArgsConstructor
public class Institution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "institution_id")
    private Long institutionId;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "code", length = 50)
    private String code;

    @Column(name = "institution_type", length = 100)
    private String institutionType;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "pincode", length = 20)
    private String pincode;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "contact_email", length = 150)
    private String contactEmail;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "logo_public_id", length = 500)
    private String logoPublicId;

    @Column(name = "logo_secure_url", length = 1000)
    private String logoSecureUrl;

    @Column(name = "logo_file_name", length = 255)
    private String logoFileName;

    @Column(name = "logo_content_type", length = 100)
    private String logoContentType;

    @Column(name = "approval_status", length = 50)
    private String approvalStatus = "APPROVED";

    @Column(name = "rejection_reason", columnDefinition = "text")
    private String rejectionReason;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
