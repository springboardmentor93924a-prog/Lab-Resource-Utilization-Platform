package com.example.lab_platform.dto;

/**
 * Aggregated utilization for a department or an institution — the
 * "Department vs. Institutional Targets" dimension called out in the
 * platform spec. One row per department (or institution) summarizing
 * the per-equipment utilization figures already computed by
 * UtilizationServiceImpl.
 */
public class UtilizationRollupDTO {

    private Integer groupId;
    private String groupName;
    private long equipmentCount;
    private double averageUtilizationPercentage;
    private double totalUsedHours;
    private double totalIdleHours;

    public UtilizationRollupDTO() {
    }

    public UtilizationRollupDTO(Integer groupId, String groupName) {
        this.groupId = groupId;
        this.groupName = groupName;
    }

    public Integer getGroupId() {
        return groupId;
    }

    public void setGroupId(Integer groupId) {
        this.groupId = groupId;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public long getEquipmentCount() {
        return equipmentCount;
    }

    public void setEquipmentCount(long equipmentCount) {
        this.equipmentCount = equipmentCount;
    }

    public double getAverageUtilizationPercentage() {
        return averageUtilizationPercentage;
    }

    public void setAverageUtilizationPercentage(double averageUtilizationPercentage) {
        this.averageUtilizationPercentage = averageUtilizationPercentage;
    }

    public double getTotalUsedHours() {
        return totalUsedHours;
    }

    public void setTotalUsedHours(double totalUsedHours) {
        this.totalUsedHours = totalUsedHours;
    }

    public double getTotalIdleHours() {
        return totalIdleHours;
    }

    public void setTotalIdleHours(double totalIdleHours) {
        this.totalIdleHours = totalIdleHours;
    }
}