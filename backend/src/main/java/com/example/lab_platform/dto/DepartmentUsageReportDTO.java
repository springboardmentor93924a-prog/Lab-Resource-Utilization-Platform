package com.example.lab_platform.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class DepartmentUsageReportDTO {

    private String reportTitle = "Department / Resource Usage Report";
    private LocalDateTime generatedAt;
    private Map<String, String> appliedFilters;

    private long totalDepartments;
    private long totalBookings;
    private double totalUsageHours;
    private String mostActiveDepartment;

    private List<DepartmentUsageRowDTO> rows;

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

    public long getTotalDepartments() {
        return totalDepartments;
    }

    public void setTotalDepartments(long totalDepartments) {
        this.totalDepartments = totalDepartments;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public double getTotalUsageHours() {
        return totalUsageHours;
    }

    public void setTotalUsageHours(double totalUsageHours) {
        this.totalUsageHours = totalUsageHours;
    }

    public String getMostActiveDepartment() {
        return mostActiveDepartment;
    }

    public void setMostActiveDepartment(String mostActiveDepartment) {
        this.mostActiveDepartment = mostActiveDepartment;
    }

    public List<DepartmentUsageRowDTO> getRows() {
        return rows;
    }

    public void setRows(List<DepartmentUsageRowDTO> rows) {
        this.rows = rows;
    }
}
