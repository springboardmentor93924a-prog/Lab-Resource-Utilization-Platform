package com.example.lab_platform.dto;

import com.example.lab_platform.entity.Maintenance;

import java.time.LocalDate;

/*
 * Read-shape for scheduled/preventive Maintenance records: equipment,
 * type, status, next-due date, and assigned technician — flattened,
 * no lazy JPA proxies (same pattern as MaintenanceServiceLogDTO).
 */
public class MaintenanceDTO {

    private Integer maintenanceId;
    private Integer equipmentId;
    private String equipmentName;
    private LocalDate maintenanceDate;
    private String maintenanceType;
    private String description;
    private String maintenanceStatus;
    private LocalDate nextMaintenanceDate;
    private Integer assignedTechnicianId;
    private String assignedTechnicianName;

    public MaintenanceDTO() {
    }

    public static MaintenanceDTO fromEntity(Maintenance maintenance) {
        if (maintenance == null) {
            return null;
        }

        MaintenanceDTO dto = new MaintenanceDTO();
        dto.setMaintenanceId(maintenance.getMaintenanceId());

        if (maintenance.getEquipment() != null) {
            dto.setEquipmentId(maintenance.getEquipment().getEquipmentId());
            dto.setEquipmentName(maintenance.getEquipment().getEquipmentName());
        }

        dto.setMaintenanceDate(maintenance.getMaintenanceDate());
        dto.setMaintenanceType(maintenance.getMaintenanceType());
        dto.setDescription(maintenance.getDescription());
        dto.setMaintenanceStatus(maintenance.getMaintenanceStatus());
        dto.setNextMaintenanceDate(maintenance.getNextMaintenanceDate());

        if (maintenance.getAssignedTechnician() != null) {
            dto.setAssignedTechnicianId(maintenance.getAssignedTechnician().getUserId());
            dto.setAssignedTechnicianName(maintenance.getAssignedTechnician().getFullName());
        }

        return dto;
    }

    public Integer getMaintenanceId() {
        return maintenanceId;
    }

    public void setMaintenanceId(Integer maintenanceId) {
        this.maintenanceId = maintenanceId;
    }

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

    public Integer getAssignedTechnicianId() {
        return assignedTechnicianId;
    }

    public void setAssignedTechnicianId(Integer assignedTechnicianId) {
        this.assignedTechnicianId = assignedTechnicianId;
    }

    public String getAssignedTechnicianName() {
        return assignedTechnicianName;
    }

    public void setAssignedTechnicianName(String assignedTechnicianName) {
        this.assignedTechnicianName = assignedTechnicianName;
    }
}
