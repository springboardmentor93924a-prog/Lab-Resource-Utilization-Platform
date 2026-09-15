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
    public static final String ACCEPTED = "ACCEPTED";
    public static final String IN_PROGRESS = "IN_PROGRESS";
    public static final String WAITING_FOR_PARTS = "WAITING_FOR_PARTS";
    public static final String PENDING_VERIFICATION = "PENDING_VERIFICATION";
    public static final String COMPLETED = "COMPLETED";
    public static final String PENDING_MANAGER_REVIEW = "PENDING_MANAGER_REVIEW";
    public static final String FINALIZED = "FINALIZED";
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

    @Column(name = "proposed_start_datetime")
    private LocalDateTime proposedStartDatetime;

    @Column(name = "proposed_end_datetime")
    private LocalDateTime proposedEndDatetime;

    @Column(name = "delay_reason", columnDefinition = "text")
    private String delayReason;

    @Column(name = "final_due_date")
    private LocalDate finalDueDate;

    @Column(name = "manager_notes", columnDefinition = "text")
    private String managerNotes;

    @Column(name = "delay_decided_by")
    private Long delayDecidedBy;

    @Column(name = "delay_decided_at")
    private LocalDateTime delayDecidedAt;

    @Column(name = "scheduled_start_datetime")
    private LocalDateTime scheduledStartDatetime;

    @Column(name = "scheduled_end_datetime")
    private LocalDateTime scheduledEndDatetime;

    @Column(name = "manager_target_start_datetime")
    private LocalDateTime managerTargetStartDatetime;

    @Column(name = "manager_target_end_datetime")
    private LocalDateTime managerTargetEndDatetime;

    @Column(name = "manager_instructions", columnDefinition = "text")
    private String managerInstructions;

    @Column(name = "plan_submitted_at")
    private LocalDateTime planSubmittedAt;

    @Column(name = "final_start_datetime")
    private LocalDateTime finalStartDatetime;

    @Column(name = "final_end_datetime")
    private LocalDateTime finalEndDatetime;

    @Column(name = "finalized_by")
    private Long finalizedBy;

    @Column(name = "finalized_at")
    private LocalDateTime finalizedAt;

    @Column(name = "cancelled_by")
    private Long cancelledBy;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancellation_reason", columnDefinition = "text")
    private String cancellationReason;

    @Column(name = "requires_parts")
    private Boolean requiresParts = false;

    @Column(name = "parts_details", columnDefinition = "text")
    private String partsDetails;

    @Column(name = "diagnostic_notes", columnDefinition = "text")
    private String diagnosticNotes;

    @Column(name = "work_performed", columnDefinition = "text")
    private String workPerformed;

    @Column(name = "parts_used", columnDefinition = "text")
    private String partsUsed;

    @Column(name = "completion_attachment_public_id", length = 500)
    private String completionAttachmentPublicId;

    @Column(name = "completion_attachment_secure_url", length = 1000)
    private String completionAttachmentSecureUrl;

    @Column(name = "completion_attachment_file_name", length = 255)
    private String completionAttachmentFileName;

    @Column(name = "verification_notes", columnDefinition = "text")
    private String verificationNotes;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
