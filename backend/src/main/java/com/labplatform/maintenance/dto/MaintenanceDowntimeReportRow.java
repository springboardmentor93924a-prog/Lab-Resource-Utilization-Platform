package com.labplatform.maintenance.dto;

public class MaintenanceDowntimeReportRow {

    private Long equipmentId;
    private String equipmentName;

    private Long totalWorkOrders;
    private Long completedWorkOrders;
    private Long inProgressWorkOrders;

    private Long totalDowntimeMinutes;

    public MaintenanceDowntimeReportRow() {
    }

    public MaintenanceDowntimeReportRow(
            Long equipmentId,
            String equipmentName,
            Long totalWorkOrders,
            Long completedWorkOrders,
            Long inProgressWorkOrders,
            Long totalDowntimeMinutes) {

        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.totalWorkOrders = totalWorkOrders;
        this.completedWorkOrders = completedWorkOrders;
        this.inProgressWorkOrders = inProgressWorkOrders;
        this.totalDowntimeMinutes = totalDowntimeMinutes;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public Long getTotalWorkOrders() {
        return totalWorkOrders;
    }

    public void setTotalWorkOrders(Long totalWorkOrders) {
        this.totalWorkOrders = totalWorkOrders;
    }

    public Long getCompletedWorkOrders() {
        return completedWorkOrders;
    }

    public void setCompletedWorkOrders(Long completedWorkOrders) {
        this.completedWorkOrders = completedWorkOrders;
    }

    public Long getInProgressWorkOrders() {
        return inProgressWorkOrders;
    }

    public void setInProgressWorkOrders(Long inProgressWorkOrders) {
        this.inProgressWorkOrders = inProgressWorkOrders;
    }

    public Long getTotalDowntimeMinutes() {
        return totalDowntimeMinutes;
    }

    public void setTotalDowntimeMinutes(Long totalDowntimeMinutes) {
        this.totalDowntimeMinutes = totalDowntimeMinutes;
    }
}