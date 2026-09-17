package com.example.lab_platform.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "maintenance")
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maintenance_id")
    private Integer maintenanceId;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(name = "maintenance_date")
    private LocalDate maintenanceDate;

    @Column(name = "maintenance_type", length = 100)
    private String maintenanceType;

    @Column(name = "description")
    private String description;

    @Column(name = "maintenance_status", length = 30)
    private String maintenanceStatus;

    @Column(name = "next_maintenance_date")
    private LocalDate nextMaintenanceDate;

    // Technician the work order is assigned to. Nullable — an unassigned
    // record simply won't show up on anyone's "My Tasks" view yet.
    @ManyToOne
    @JoinColumn(name = "assigned_technician_id")
    private User assignedTechnician;

    // Set only when a Lab Manager rejects work the technician
    // submitted for verification and sends it back to be redone.
    // Cleared again once the task moves on from "Rejected" (the redo
    // being restarted) — see MaintenanceServiceImpl.updateMaintenance.
    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    public Maintenance() {
    }

    public Integer getMaintenanceId() {
        return maintenanceId;
    }

    public void setMaintenanceId(Integer maintenanceId) {
        this.maintenanceId = maintenanceId;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public LocalDate getMaintenanceDate() {
        return maintenanceDate;
    }

    public void setMaintenanceDate(LocalDate maintenanceDate) {
        this.maintenanceDate = maintenanceDate;
    }

    public String getMaintenanceType() {
        return maintenanceType;
    }

    public void setMaintenanceType(String maintenanceType) {
        this.maintenanceType = maintenanceType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getMaintenanceStatus() {
        return maintenanceStatus;
    }

    public void setMaintenanceStatus(String maintenanceStatus) {
        this.maintenanceStatus = maintenanceStatus;
    }

    public LocalDate getNextMaintenanceDate() {
        return nextMaintenanceDate;
    }

    public void setNextMaintenanceDate(LocalDate nextMaintenanceDate) {
        this.nextMaintenanceDate = nextMaintenanceDate;
    }

    public User getAssignedTechnician() {
        return assignedTechnician;
    }

    public void setAssignedTechnician(User assignedTechnician) {
        this.assignedTechnician = assignedTechnician;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}