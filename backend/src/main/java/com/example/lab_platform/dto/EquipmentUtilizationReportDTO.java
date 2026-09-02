package com.example.lab_platform.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class EquipmentUtilizationReportDTO {

    private String reportTitle = "Equipment Utilization Report";
    private LocalDateTime generatedAt;
    private Map<String, String> appliedFilters;

    private long totalEquipment;
    private double averageUtilization;
    private double totalBookedHours;
    private double totalAvailableHours;
    private String highestUtilizationEquipment;
    private String lowestUtilizationEquipment;

    private List<EquipmentUtilizationRowDTO> rows;

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

    public long getTotalEquipment() {
        return totalEquipment;
    }

    public void setTotalEquipment(long totalEquipment) {
        this.totalEquipment = totalEquipment;
    }

    public double getAverageUtilization() {
        return averageUtilization;
    }

    public void setAverageUtilization(double averageUtilization) {
        this.averageUtilization = averageUtilization;
    }

    public double getTotalBookedHours() {
        return totalBookedHours;
    }

    public void setTotalBookedHours(double totalBookedHours) {
        this.totalBookedHours = totalBookedHours;
    }

    public double getTotalAvailableHours() {
        return totalAvailableHours;
    }

    public void setTotalAvailableHours(double totalAvailableHours) {
        this.totalAvailableHours = totalAvailableHours;
    }

    public String getHighestUtilizationEquipment() {
        return highestUtilizationEquipment;
    }

    public void setHighestUtilizationEquipment(String highestUtilizationEquipment) {
        this.highestUtilizationEquipment = highestUtilizationEquipment;
    }

    public String getLowestUtilizationEquipment() {
        return lowestUtilizationEquipment;
    }

    public void setLowestUtilizationEquipment(String lowestUtilizationEquipment) {
        this.lowestUtilizationEquipment = lowestUtilizationEquipment;
    }

    public List<EquipmentUtilizationRowDTO> getRows() {
        return rows;
    }

    public void setRows(List<EquipmentUtilizationRowDTO> rows) {
        this.rows = rows;
    }
}
