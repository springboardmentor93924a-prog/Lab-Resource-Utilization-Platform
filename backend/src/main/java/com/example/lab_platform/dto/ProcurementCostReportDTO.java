package com.example.lab_platform.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ProcurementCostReportDTO {

    private String reportTitle = "Procurement & Cost Analysis Report";
    private LocalDateTime generatedAt;
    private Map<String, String> appliedFilters;

    private double totalPurchaseCost;
    private double totalUsageCost;
    private double totalMaintenanceCost;
    private double totalOperationalCost;
    private String highestCostEquipment;
    private String mostUsedEquipment;
    private long equipmentMissingPurchaseCost;

    private List<ProcurementCostRowDTO> rows;

    public String getReportTitle() {
        return reportTitle;
    }

    public void setReportTitle(String reportTitle) {
        this.reportTitle = reportTitle;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public Map<String, String> getAppliedFilters() {
        return appliedFilters;
    }

    public void setAppliedFilters(Map<String, String> appliedFilters) {
        this.appliedFilters = appliedFilters;
    }

    public double getTotalPurchaseCost() {
        return totalPurchaseCost;
    }

    public void setTotalPurchaseCost(double totalPurchaseCost) {
        this.totalPurchaseCost = totalPurchaseCost;
    }

    public double getTotalUsageCost() {
        return totalUsageCost;
    }

    public void setTotalUsageCost(double totalUsageCost) {
        this.totalUsageCost = totalUsageCost;
    }

    public double getTotalMaintenanceCost() {
        return totalMaintenanceCost;
    }

    public void setTotalMaintenanceCost(double totalMaintenanceCost) {
        this.totalMaintenanceCost = totalMaintenanceCost;
    }

    public double getTotalOperationalCost() {
        return totalOperationalCost;
    }

    public void setTotalOperationalCost(double totalOperationalCost) {
        this.totalOperationalCost = totalOperationalCost;
    }

    public String getHighestCostEquipment() {
        return highestCostEquipment;
    }

    public void setHighestCostEquipment(String highestCostEquipment) {
        this.highestCostEquipment = highestCostEquipment;
    }

    public String getMostUsedEquipment() {
        return mostUsedEquipment;
    }

    public void setMostUsedEquipment(String mostUsedEquipment) {
        this.mostUsedEquipment = mostUsedEquipment;
    }

    public long getEquipmentMissingPurchaseCost() {
        return equipmentMissingPurchaseCost;
    }

    public void setEquipmentMissingPurchaseCost(long equipmentMissingPurchaseCost) {
        this.equipmentMissingPurchaseCost = equipmentMissingPurchaseCost;
    }

    public List<ProcurementCostRowDTO> getRows() {
        return rows;
    }

    public void setRows(List<ProcurementCostRowDTO> rows) {
        this.rows = rows;
    }
}
