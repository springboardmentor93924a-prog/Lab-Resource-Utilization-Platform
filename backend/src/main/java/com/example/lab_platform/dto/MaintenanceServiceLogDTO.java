package com.example.lab_platform.dto;

import com.example.lab_platform.entity.MaintenanceServiceLog;

import java.time.LocalDate;

/*
 * Read-shape for Maintenance Service Log: service details,
 * technician, service date, cost, and remarks — flattened, no lazy
 * JPA proxies.
 */
public class MaintenanceServiceLogDTO {

    private Integer serviceLogId;
    private Integer workOrderId;
    private Integer equipmentId;
    private String equipmentName;
    private Integer technicianId;
    private String technicianName;
    private LocalDate serviceDate;
    private String serviceDescription;
    private String partsReplaced;
    private Double serviceCost;
    private String remarks;

    public MaintenanceServiceLogDTO() {
    }

    public static MaintenanceServiceLogDTO fromEntity(MaintenanceServiceLog log) {
        if (log == null) {
            return null;
        }

        MaintenanceServiceLogDTO dto = new MaintenanceServiceLogDTO();
        dto.setServiceLogId(log.getServiceLogId());

        if (log.getWorkOrder() != null) {
            dto.setWorkOrderId(log.getWorkOrder().getWorkOrderId());
            if (log.getWorkOrder().getEquipment() != null) {
                dto.setEquipmentId(log.getWorkOrder().getEquipment().getEquipmentId());
                dto.setEquipmentName(log.getWorkOrder().getEquipment().getEquipmentName());
            }
        }

        if (log.getTechnician() != null) {
            dto.setTechnicianId(log.getTechnician().getUserId());
            dto.setTechnicianName(log.getTechnician().getFullName());
        }

        dto.setServiceDate(log.getServiceDate());
        dto.setServiceDescription(log.getServiceDescription());
        dto.setPartsReplaced(log.getPartsReplaced());
        dto.setServiceCost(log.getServiceCost());
        dto.setRemarks(log.getRemarks());

        return dto;
    }

    public Integer getServiceLogId() {
        return serviceLogId;
    }

    public void setServiceLogId(Integer serviceLogId) {
        this.serviceLogId = serviceLogId;
    }

    public Integer getWorkOrderId() {
        return workOrderId;
    }

    public void setWorkOrderId(Integer workOrderId) {
        this.workOrderId = workOrderId;
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

    public Integer getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Integer technicianId) {
        this.technicianId = technicianId;
    }

    public String getTechnicianName() {
        return technicianName;
    }

    public void setTechnicianName(String technicianName) {
        this.technicianName = technicianName;
    }

    public LocalDate getServiceDate() {
        return serviceDate;
    }

    public void setServiceDate(LocalDate serviceDate) {
        this.serviceDate = serviceDate;
    }

    public String getServiceDescription() {
        return serviceDescription;
    }

    public void setServiceDescription(String serviceDescription) {
        this.serviceDescription = serviceDescription;
    }

    public String getPartsReplaced() {
        return partsReplaced;
    }

    public void setPartsReplaced(String partsReplaced) {
        this.partsReplaced = partsReplaced;
    }

    public Double getServiceCost() {
        return serviceCost;
    }

    public void setServiceCost(Double serviceCost) {
        this.serviceCost = serviceCost;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
