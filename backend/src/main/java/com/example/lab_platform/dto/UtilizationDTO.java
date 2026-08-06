 package com.example.lab_platform.dto;

public class UtilizationDTO {

    private String equipmentName;
    private double usedHours;
    private double idleHours;
    private double utilizationPercentage;
    private String category;

    public UtilizationDTO(String equipmentName, double usedHours, double idleHours, double utilizationPercentage, String category) {
        this.equipmentName = equipmentName;
        this.usedHours = usedHours;
        this.idleHours = idleHours;
        this.utilizationPercentage = utilizationPercentage;
        this.category = category;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public double getUsedHours() {
        return usedHours;
    }

    public double getIdleHours() {
        return idleHours;
    }

    public double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public String getCategory() {
        return category;
    }
}