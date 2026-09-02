package com.labresource.dto;

public class EquipmentDowntimeResponseDto {
    private String equipmentId;
    private String equipmentName;
    private long totalDowntimeMinutes;
    private long maintenanceRecordCount;

    public String getEquipmentId() { return equipmentId; }
    public void setEquipmentId(String equipmentId) { this.equipmentId = equipmentId; }
    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }
    public long getTotalDowntimeMinutes() { return totalDowntimeMinutes; }
    public void setTotalDowntimeMinutes(long totalDowntimeMinutes) { this.totalDowntimeMinutes = totalDowntimeMinutes; }
    public long getMaintenanceRecordCount() { return maintenanceRecordCount; }
    public void setMaintenanceRecordCount(long maintenanceRecordCount) { this.maintenanceRecordCount = maintenanceRecordCount; }
}
