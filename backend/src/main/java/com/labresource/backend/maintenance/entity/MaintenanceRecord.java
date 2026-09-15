package com.labresource.backend.maintenance.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "MaintenanceRecord")
@Getter
@Setter
@NoArgsConstructor
public class MaintenanceRecord {

    public static final String PENDING = "PENDING";
    public static final String IN_PROGRESS = "IN_PROGRESS";
    public static final String WAITING_FOR_PARTS = "WAITING_FOR_PARTS";
    public static final String COMPLETED = "COMPLETED";
    public static final String CANCELLED = "CANCELLED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maintenance_id")
    private Long maintenanceId;

    @Column(name = "equipment_id", nullable = false)
    private Long equipmentId;

    @Column(name = "technician_id")
    private Long technicianId;

    @Column(name = "issue_report_id")
    private Long issueReportId;

    @Column(name = "maintenance_type", nullable = false, length = 30)
    private String maintenanceType = "CORRECTIVE"; // PREVENTIVE, CORRECTIVE, CALIBRATION, INSPECTION, EMERGENCY_REPAIR

    @Column(name = "status", nullable = false, length = 30)
    private String status = PENDING; // PENDING, IN_PROGRESS, WAITING_FOR_PARTS, COMPLETED, CANCELLED

    @Column(name = "priority", nullable = false, length = 20)
    private String priority = "MEDIUM";

    @Column(name = "reason", columnDefinition = "text")
    private String reason;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "inspection_notes", columnDefinition = "text")
    private String inspectionNotes;

    @Column(name = "work_performed", columnDefinition = "text")
    private String workPerformed;

    @Column(name = "parts_used", columnDefinition = "text")
    private String partsUsed;

    @Column(name = "parts_cost")
    private BigDecimal partsCost = BigDecimal.ZERO;

    @Column(name = "labour_cost")
    private BigDecimal labourCost = BigDecimal.ZERO;

    @Column(name = "total_cost")
    private BigDecimal totalCost = BigDecimal.ZERO;

    @Column(name = "condition_before", length = 100)
    private String conditionBefore;

    @Column(name = "condition_after", length = 100)
    private String conditionAfter;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "next_maintenance_date")
    private LocalDate nextMaintenanceDate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
