package com.example.lab_platform.dto;

import java.time.LocalDate;

public class ProcurementCostRowDTO {

    private Integer equipmentId;
    private String equipmentName;
    private String category;
    private String departmentName;
    private String institutionName;
    private LocalDate purchaseDate;
    private Double purchaseCost;
    private double usageCost;
    private double maintenanceCost;
    private double totalOperationalCost;
    private double utilizationPercentage;
    private Double costPerUsageHour;

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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public Double getPurchaseCost() {
        return purchaseCost;
    }

    public void setPurchaseCost(Double purchaseCost) {
        this.purchaseCost = purchaseCost;
    }

    public double getUsageCost() {
        return usageCost;
    }

    public void setUsageCost(double usageCost) {
        this.usageCost = usageCost;
    }

    public double getMaintenanceCost() {
        return maintenanceCost;
    }

    public void setMaintenanceCost(double maintenanceCost) {
        this.maintenanceCost = maintenanceCost;
    }

    public double getTotalOperationalCost() {
        return totalOperationalCost;
    }

    public void setTotalOperationalCost(double totalOperationalCost) {
        this.totalOperationalCost = totalOperationalCost;
    }

    public double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(double utilizationPercentage) {
        this.utilizationPercentage = utilizationPercentage;
    }

    public Double getCostPerUsageHour() {
        return costPerUsageHour;
    }

    public void setCostPerUsageHour(Double costPerUsageHour) {
        this.costPerUsageHour = costPerUsageHour;
    }
}
