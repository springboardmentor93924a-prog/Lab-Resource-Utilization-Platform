package com.example.lab_platform.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class MaintenanceDowntimeRowDTO {

    private Integer equipmentId;
    private String equipmentName;
    private String departmentName;
    private String maintenanceType;
    private LocalDate maintenanceDate;
    private String maintenanceStatus;
    private String workOrderStatus;
    private String assignedTechnician;
    private LocalDateTime downtimeStart;
    private LocalDateTime downtimeEnd;
    private double downtimeHours;
    private String downtimeReason;

    public Integer getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Integer equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getMaintenanceType() {
        return maintenanceType;
    }

    public void setMaintenanceType(String maintenanceType) {
        this.maintenanceType = maintenanceType;
    }

    public LocalDate getMaintenanceDate() {
        return maintenanceDate;
    }

    public void setMaintenanceDate(LocalDate maintenanceDate) {
        this.maintenanceDate = maintenanceDate;
    }

    public String getMaintenanceStatus() {
        return maintenanceStatus;
    }

    public void setMaintenanceStatus(String maintenanceStatus) {
        this.maintenanceStatus = maintenanceStatus;
    }

    public String getWorkOrderStatus() {
        return workOrderStatus;
    }

    public void setWorkOrderStatus(String workOrderStatus) {
        this.workOrderStatus = workOrderStatus;
    }

    public String getAssignedTechnician() {
        return assignedTechnician;
    }

    public void setAssignedTechnician(String assignedTechnician) {
        this.assignedTechnician = assignedTechnician;
    }

    public LocalDateTime getDowntimeStart() {
        return downtimeStart;
    }

    public void setDowntimeStart(LocalDateTime downtimeStart) {
        this.downtimeStart = downtimeStart;
    }

    public LocalDateTime getDowntimeEnd() {
        return downtimeEnd;
    }

    public void setDowntimeEnd(LocalDateTime downtimeEnd) {
        this.downtimeEnd = downtimeEnd;
    }

    public double getDowntimeHours() {
        return downtimeHours;
    }

    public void setDowntimeHours(double downtimeHours) {
        this.downtimeHours = downtimeHours;
    }

    public String getDowntimeReason() {
        return downtimeReason;
    }

    public void setDowntimeReason(String downtimeReason) {
        this.downtimeReason = downtimeReason;
    }
}
