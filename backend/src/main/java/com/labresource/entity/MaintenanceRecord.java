package com.labresource.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "maintenance_records")
public class MaintenanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maintenance_id")
    private Long maintenanceId;

    @Column(name = "equipment_id", nullable = false, insertable = false, updatable = false)
    private Long equipmentId;

    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(name = "maintenance_type", nullable = false, length = 50)
    private String maintenanceType;

    @Column(name = "maintenance_date", nullable = false)
    private String maintenanceDate;

    @Column(name = "performed_by", length = 100)
    private String performedBy;

    @Column(name = "cost")
    private Double cost;

    @Column(name = "next_due_date")
    private String nextDueDate;

    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "remarks", length = 255)
    private String remarks;

    // Default Constructor
    public MaintenanceRecord() {
    }

    // Parameterized Constructor
    public MaintenanceRecord(Long maintenanceId,
                             Long equipmentId,
                             String maintenanceType,
                             String maintenanceDate,
                             String performedBy,
                             Double cost,
                             String nextDueDate,
                             String status,
                             String remarks) {

        this.maintenanceId = maintenanceId;
        this.equipmentId = equipmentId;
        this.maintenanceType = maintenanceType;
        this.maintenanceDate = maintenanceDate;
        this.performedBy = performedBy;
        this.cost = cost;
        this.nextDueDate = nextDueDate;
        this.status = status;
        this.remarks = remarks;
    }

    public Long getMaintenanceId() {
        return maintenanceId;
    }

    public void setMaintenanceId(Long maintenanceId) {
        this.maintenanceId = maintenanceId;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getMaintenanceType() {
        return maintenanceType;
    }

    public void setMaintenanceType(String maintenanceType) {
        this.maintenanceType = maintenanceType;
    }

    public String getMaintenanceDate() {
        return maintenanceDate;
    }

    public void setMaintenanceDate(String maintenanceDate) {
        this.maintenanceDate = maintenanceDate;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }

    public String getNextDueDate() {
        return nextDueDate;
    }

    public void setNextDueDate(String nextDueDate) {
        this.nextDueDate = nextDueDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }
}