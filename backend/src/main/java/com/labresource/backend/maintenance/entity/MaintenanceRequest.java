package com.labresource.backend.maintenance.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "MaintenanceRequest")
@Getter
@Setter
@NoArgsConstructor
public class MaintenanceRequest {

    public static final String OPEN = "OPEN";
    public static final String ASSIGNED = "ASSIGNED";
    public static final String IN_PROGRESS = "IN_PROGRESS";
    public static final String WAITING_FOR_PARTS = "WAITING_FOR_PARTS";
    public static final String PENDING_VERIFICATION = "PENDING_VERIFICATION";
    public static final String COMPLETED = "COMPLETED";
    public static final String REJECTED = "REJECTED";
    public static final String ON_HOLD = "ON_HOLD";
    public static final String CANCELLED = "CANCELLED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maintenance_id")
    private Long maintenanceId;

    @Column(name = "maintenance_code", unique = true, length = 30)
    private String maintenanceCode;

    @Column(name = "equipment_id", nullable = false)
    private Long equipmentId;

    @Column(name = "requested_by", nullable = false)
    private Long requestedBy;

    @Column(name = "assigned_technician_id")
    private Long assignedTechnicianId;

    @Column(name = "issue_type", length = 100)
    private String issueType;

    @Column(name = "issue_description", nullable = false, columnDefinition = "text")
    private String issueDescription;

    @Column(name = "priority", nullable = false, length = 20)
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "attachment_public_id", length = 500)
    private String attachmentPublicId;

    @Column(name = "attachment_secure_url", length = 1000)
    private String attachmentSecureUrl;

    @Column(name = "attachment_file_name", length = 255)
    private String attachmentFileName;

    @Column(name = "attachment_content_type", length = 100)
    private String attachmentContentType;

    @Column(name = "status", nullable = false, length = 30)
    private String status = OPEN;

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @Column(name = "downtime_hours")
    private BigDecimal downtimeHours;

    @Column(name = "issue_report_id")
    private Long issueReportId;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "downtime_started_at")
    private LocalDateTime downtimeStartedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "scheduled_start_datetime")
    private LocalDateTime scheduledStartDatetime;

    @Column(name = "scheduled_end_datetime")
    private LocalDateTime scheduledEndDatetime;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
