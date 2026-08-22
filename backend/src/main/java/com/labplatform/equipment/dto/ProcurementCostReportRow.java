package com.labplatform.equipment.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ProcurementCostReportRow {

    private Long equipmentId;
    private String equipmentName;
    private String assetTag;
    private String category;
    private String department;
    private String manufacturer;
    private String supplier;
    private LocalDate purchaseDate;

    private BigDecimal purchaseCost;
    private Integer usageHours;
    private BigDecimal operatingCost;
    private BigDecimal totalCost;

    public ProcurementCostReportRow() {
    }

    public ProcurementCostReportRow(
            Long equipmentId,
            String equipmentName,
            String assetTag,
            String category,
            String department,
            String manufacturer,
            String supplier,
            LocalDate purchaseDate,
            BigDecimal purchaseCost,
            Integer usageHours,
            BigDecimal operatingCost,
            BigDecimal totalCost) {

        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.assetTag = assetTag;
        this.category = category;
        this.department = department;
        this.manufacturer = manufacturer;
        this.supplier = supplier;
        this.purchaseDate = purchaseDate;
        this.purchaseCost = purchaseCost;
        this.usageHours = usageHours;
        this.operatingCost = operatingCost;
        this.totalCost = totalCost;
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

    public String getAssetTag() {
        return assetTag;
    }

    public void setAssetTag(String assetTag) {
        this.assetTag = assetTag;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public BigDecimal getPurchaseCost() {
        return purchaseCost;
    }

    public void setPurchaseCost(BigDecimal purchaseCost) {
        this.purchaseCost = purchaseCost;
    }

    public Integer getUsageHours() {
        return usageHours;
    }

    public void setUsageHours(Integer usageHours) {
        this.usageHours = usageHours;
    }

    public BigDecimal getOperatingCost() {
        return operatingCost;
    }

    public void setOperatingCost(BigDecimal operatingCost) {
        this.operatingCost = operatingCost;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }
}