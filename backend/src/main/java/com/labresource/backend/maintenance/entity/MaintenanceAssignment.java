package com.labresource.backend.maintenance.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "MaintenanceAssignment")
@Getter
@Setter
@NoArgsConstructor
public class MaintenanceAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Long assignmentId;

    @Column(name = "maintenance_id", nullable = false)
    private Long maintenanceId;

    @Column(name = "technician_id", nullable = false)
    private Long technicianId;

    @Column(name = "assigned_by", nullable = false)
    private Long assignedBy;

    @Column(name = "assigned_at", insertable = false, updatable = false)
    private LocalDateTime assignedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "technician_seen_at")
    private LocalDateTime technicianSeenAt;

    @Column(name = "technician_acknowledged_at")
    private LocalDateTime technicianAcknowledgedAt;

    @Column(name = "removed_by")
    private Long removedBy;

    @Column(name = "removed_at")
    private LocalDateTime removedAt;

    @Column(name = "removal_reason", columnDefinition = "text")
    private String removalReason;

    @Column(name = "reassigned_from_assignment_id")
    private Long reassignedFromAssignmentId;

    @Column(name = "technician_response", length = 50)
    private String technicianResponse;

    @Column(name = "technician_accepted_at")
    private LocalDateTime technicianAcceptedAt;

    @Column(name = "target_start_datetime")
    private LocalDateTime targetStartDatetime;

    @Column(name = "target_completion_datetime")
    private LocalDateTime targetCompletionDatetime;

    @Column(name = "proposed_start_datetime")
    private LocalDateTime proposedStartDatetime;

    @Column(name = "proposed_completion_datetime")
    private LocalDateTime proposedCompletionDatetime;

    @Column(name = "delay_justification", columnDefinition = "text")
    private String delayJustification;

    @Column(name = "delay_requested_at")
    private LocalDateTime delayRequestedAt;

    @Column(name = "final_start_datetime")
    private LocalDateTime finalStartDatetime;

    @Column(name = "final_completion_datetime")
    private LocalDateTime finalCompletionDatetime;

    @Column(name = "finalized_by")
    private Long finalizedBy;

    @Column(name = "finalized_at")
    private LocalDateTime finalizedAt;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ASSIGNED"; // ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED, REMOVED, REASSIGNED

    @Column(name = "problem_description", columnDefinition = "text")
    private String problemDescription;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;
}
