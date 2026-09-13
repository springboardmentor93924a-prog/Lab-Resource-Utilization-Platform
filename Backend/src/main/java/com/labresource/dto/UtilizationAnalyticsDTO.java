package com.labresource.dto;

public class UtilizationAnalyticsDTO {

    private Long equipmentId;
    private String equipmentName;

    private double usageHours;
    private double utilizationPercentage;
    private double idleHours;

    private String utilizationLevel;
    private String lastUsedAt;

    public UtilizationAnalyticsDTO() {
    }

    public UtilizationAnalyticsDTO(
            Long equipmentId,
            String equipmentName,
            double usageHours,
            double utilizationPercentage,
            double idleHours,
            String utilizationLevel,
            String lastUsedAt
    ) {
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.usageHours = usageHours;
        this.utilizationPercentage = utilizationPercentage;
        this.idleHours = idleHours;
        this.utilizationLevel = utilizationLevel;
        this.lastUsedAt = lastUsedAt;
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

    public double getUsageHours() {
        return usageHours;
    }

    public void setUsageHours(double usageHours) {
        this.usageHours = usageHours;
    }

    public double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(
            double utilizationPercentage
    ) {
        this.utilizationPercentage =
                utilizationPercentage;
    }

    public double getIdleHours() {
        return idleHours;
    }

    public void setIdleHours(double idleHours) {
        this.idleHours = idleHours;
    }

    public String getUtilizationLevel() {
        return utilizationLevel;
    }

    public void setUtilizationLevel(
            String utilizationLevel
    ) {
        this.utilizationLevel =
                utilizationLevel;
    }

    public String getLastUsedAt() {
        return lastUsedAt;
    }

    public void setLastUsedAt(String lastUsedAt) {
        this.lastUsedAt = lastUsedAt;
    }
}