package com.labresource.backend.laboratory.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Laboratory")
@Getter
@Setter
@NoArgsConstructor
public class Laboratory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lab_id")
    private Long labId;

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "location", length = 150)
    private String location;

    @Column(name = "capacity")
    private Integer capacity = 1;

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
