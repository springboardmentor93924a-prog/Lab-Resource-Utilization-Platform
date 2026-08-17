package com.labplatform.maintenance.model;

import com.labplatform.auth.model.User;
import com.labplatform.equipment.model.Equipment;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "work_orders")
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by", nullable = false)
    private User reportedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Column(name = "issue_description", nullable = false)
    private String issueDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkOrderPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkOrderStatus status;

    /*
     * Time when the equipment actually entered maintenance.
     */
    @Column(name = "maintenance_started_at")
    private LocalDateTime maintenanceStartedAt;

    /*
     * Description of the repair/service performed.
     */
    @Column(name = "service_log", columnDefinition = "TEXT")
    private String serviceLog;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public WorkOrder() {
    }

    @PrePersist
    protected void onCreate() {

        this.createdAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = WorkOrderStatus.OPEN;
        }

        if (this.priority == null) {
            this.priority = WorkOrderPriority.MEDIUM;
        }

        /*
         * A work order puts the equipment into maintenance.
         * Therefore maintenance starts when the work order is created.
         */
        if (this.maintenanceStartedAt == null) {
            this.maintenanceStartedAt = LocalDateTime.now();
        }
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public User getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(User reportedBy) {
        this.reportedBy = reportedBy;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getIssueDescription() {
        return issueDescription;
    }

    public void setIssueDescription(String issueDescription) {
        this.issueDescription = issueDescription;
    }

    public WorkOrderPriority getPriority() {
        return priority;
    }

    public void setPriority(WorkOrderPriority priority) {
        this.priority = priority;
    }

    public WorkOrderStatus getStatus() {
        return status;
    }

    public void setStatus(WorkOrderStatus status) {
        this.status = status;
    }

    public LocalDateTime getMaintenanceStartedAt() {
        return maintenanceStartedAt;
    }

    public void setMaintenanceStartedAt(LocalDateTime maintenanceStartedAt) {
        this.maintenanceStartedAt = maintenanceStartedAt;
    }

    public String getServiceLog() {
        return serviceLog;
    }

    public void setServiceLog(String serviceLog) {
        this.serviceLog = serviceLog;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}