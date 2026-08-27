package com.example.lab_platform.dto;

import com.example.lab_platform.entity.EquipmentDowntime;

import java.time.LocalDateTime;

/*
 * Read-shape for Equipment Downtime: equipment, downtime start,
 * downtime end, reason, and duration. Duration is never computed
 * live/in real time — it is derived only from the stored start/end
 * timestamps (see EquipmentDowntime.getDurationMinutes()), and is
 * null while the window is still open.
 */
public class EquipmentDowntimeDTO {

    private Integer downtimeId;
    private Integer equipmentId;
    private String equipmentName;
    private Integer workOrderId;
    private Integer maintenanceId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String reason;
    private String downtimeStatus;
    private Long durationMinutes;

    public EquipmentDowntimeDTO() {
    }

    public static EquipmentDowntimeDTO fromEntity(EquipmentDowntime downtime) {
        if (downtime == null) {
            return null;
        }

        EquipmentDowntimeDTO dto = new EquipmentDowntimeDTO();
        dto.setDowntimeId(downtime.getDowntimeId());

        if (downtime.getEquipment() != null) {
            dto.setEquipmentId(downtime.getEquipment().getEquipmentId());
            dto.setEquipmentName(downtime.getEquipment().getEquipmentName());
        }

        if (downtime.getWorkOrder() != null) {
            dto.setWorkOrderId(downtime.getWorkOrder().getWorkOrderId());
        }

        if (downtime.getMaintenance() != null) {
            dto.setMaintenanceId(downtime.getMaintenance().getMaintenanceId());
        }

        dto.setStartDate(downtime.getStartDate());
        dto.setEndDate(downtime.getEndDate());
        dto.setReason(downtime.getReason());
        dto.setDowntimeStatus(downtime.getDowntimeStatus());
        dto.setDurationMinutes(downtime.getDurationMinutes());

        return dto;
    }

    public Integer getDowntimeId() {
        return downtimeId;
    }

    public void setDowntimeId(Integer downtimeId) {
        this.downtimeId = downtimeId;
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

    public Integer getWorkOrderId() {
        return workOrderId;
    }

    public void setWorkOrderId(Integer workOrderId) {
        this.workOrderId = workOrderId;
    }

    public Integer getMaintenanceId() {
        return maintenanceId;
    }

    public void setMaintenanceId(Integer maintenanceId) {
        this.maintenanceId = maintenanceId;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDowntimeStatus() {
        return downtimeStatus;
    }

    public void setDowntimeStatus(String downtimeStatus) {
        this.downtimeStatus = downtimeStatus;
    }

    public Long getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Long durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
}
