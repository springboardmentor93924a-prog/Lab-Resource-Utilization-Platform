package com.example.lab_platform.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

/*
 * Maps to the pre-existing "maintenance" table — this table already
 * had real data in the database (scheduled/preventive maintenance
 * history: type, date, status, next-due date, assigned technician)
 * but had no entity/repository/service/controller layer at all until
 * now. It is deliberately separate from:
 *   - MaintenanceRequest  -> "maintenance_requests" (student/technician/
 *     manager request lifecycle: PENDING -> IN_PROGRESS -> ...)
 *   - MaintenanceServiceLog -> "maintenance_service_logs" (technician's
 *     service entries recorded against a WorkOrder)
 * This entity is the scheduled/preventive maintenance record itself.
 *
 * Every column below is nullable at the DB level (only maintenance_id
 * is NOT NULL) and real rows exist with a null assigned_technician_id,
 * so nothing here is marked nullable = false, and both associations
 * are LAZY — avoiding the exact EAGER + nullable=false inner-join trap
 * that previously broke Equipment.institution.
 */
@Entity
@Table(name = "maintenance")
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maintenance_id")
    private Integer maintenanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(name = "maintenance_date")
    private LocalDate maintenanceDate;

    @Column(name = "maintenance_type", length = 100)
    private String maintenanceType;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "maintenance_status", length = 30)
    private String maintenanceStatus;

    @Column(name = "next_maintenance_date")
    private LocalDate nextMaintenanceDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_technician_id")
    private User assignedTechnician;

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
}
