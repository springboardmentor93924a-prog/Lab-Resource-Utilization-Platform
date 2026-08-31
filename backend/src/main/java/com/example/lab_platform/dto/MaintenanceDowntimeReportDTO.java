package com.example.lab_platform.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class MaintenanceDowntimeReportDTO {

    private String reportTitle = "Maintenance & Downtime Report";
    private LocalDateTime generatedAt;
    private Map<String, String> appliedFilters;

    private long totalMaintenanceEvents;
    private long totalDowntimeEvents;
    private double totalDowntimeHours;
    private double averageDowntimeHours;
    private String equipmentWithHighestDowntime;

    private List<MaintenanceDowntimeRowDTO> rows;

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

    public long getTotalMaintenanceEvents() {
        return totalMaintenanceEvents;
    }

    public void setTotalMaintenanceEvents(long totalMaintenanceEvents) {
        this.totalMaintenanceEvents = totalMaintenanceEvents;
    }

    public long getTotalDowntimeEvents() {
        return totalDowntimeEvents;
    }

    public void setTotalDowntimeEvents(long totalDowntimeEvents) {
        this.totalDowntimeEvents = totalDowntimeEvents;
    }

    public double getTotalDowntimeHours() {
        return totalDowntimeHours;
    }

    public void setTotalDowntimeHours(double totalDowntimeHours) {
        this.totalDowntimeHours = totalDowntimeHours;
    }

    public double getAverageDowntimeHours() {
        return averageDowntimeHours;
    }

    public void setAverageDowntimeHours(double averageDowntimeHours) {
        this.averageDowntimeHours = averageDowntimeHours;
    }

    public String getEquipmentWithHighestDowntime() {
        return equipmentWithHighestDowntime;
    }

    public void setEquipmentWithHighestDowntime(String equipmentWithHighestDowntime) {
        this.equipmentWithHighestDowntime = equipmentWithHighestDowntime;
    }

    public List<MaintenanceDowntimeRowDTO> getRows() {
        return rows;
    }

    public void setRows(List<MaintenanceDowntimeRowDTO> rows) {
        this.rows = rows;
    }
}
