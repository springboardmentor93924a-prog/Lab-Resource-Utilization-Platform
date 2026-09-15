package com.labresource.backend.department.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Department")
@Getter
@Setter
@NoArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "code", length = 50)
    private String code;

    @Column(name = "department_head_id")
    private Long departmentHeadId;

    @Column(name = "budget_allocated")
    private BigDecimal budgetAllocated = BigDecimal.ZERO;

    // ── Cloudinary Image Metadata ─────────────────────────────────────────────
    @Column(name = "image_public_id", length = 500)
    private String imagePublicId;

    @Column(name = "image_secure_url", length = 1000)
    private String imageSecureUrl;

    @Column(name = "image_file_name", length = 255)
    private String imageFileName;

    @Column(name = "image_content_type", length = 100)
    private String imageContentType;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
