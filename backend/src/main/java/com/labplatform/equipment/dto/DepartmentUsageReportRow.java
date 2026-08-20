package com.labplatform.equipment.dto;

public class DepartmentUsageReportRow {

    private String department;
    private Long totalBookings;
    private Long usageHours;
    private Long equipmentCount;
    private Double utilizationRate;

    public DepartmentUsageReportRow() {
    }

    public DepartmentUsageReportRow(
            String department,
            Long totalBookings,
            Long usageHours,
            Long equipmentCount,
            Double utilizationRate) {

        this.department = department;
        this.totalBookings = totalBookings;
        this.usageHours = usageHours;
        this.equipmentCount = equipmentCount;
        this.utilizationRate = utilizationRate;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(Long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public Long getUsageHours() {
        return usageHours;
    }

    public void setUsageHours(Long usageHours) {
        this.usageHours = usageHours;
    }

    public Long getEquipmentCount() {
        return equipmentCount;
    }

    public void setEquipmentCount(Long equipmentCount) {
        this.equipmentCount = equipmentCount;
    }

    public Double getUtilizationRate() {
        return utilizationRate;
    }

    public void setUtilizationRate(Double utilizationRate) {
        this.utilizationRate = utilizationRate;
    }
}