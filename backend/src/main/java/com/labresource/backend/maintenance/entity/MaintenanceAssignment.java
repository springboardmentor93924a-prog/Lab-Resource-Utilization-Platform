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

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ASSIGNED"; // ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(name = "notes", columnDefinition = "text")
    private String notes;
}
