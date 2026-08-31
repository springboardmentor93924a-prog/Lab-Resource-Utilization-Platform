package com.example.lab_platform.dto;

public class DepartmentUsageRowDTO {

    private Integer departmentId;
    private String departmentName;
    private long equipmentCount;
    private long bookingCount;
    private double totalUsageHours;
    private double totalAvailableHours;
    private double utilizationPercentage;
    private String mostUsedEquipment;

    public Integer getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Integer departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public long getEquipmentCount() {
        return equipmentCount;
    }

    public void setEquipmentCount(long equipmentCount) {
        this.equipmentCount = equipmentCount;
    }

    public long getBookingCount() {
        return bookingCount;
    }

    public void setBookingCount(long bookingCount) {
        this.bookingCount = bookingCount;
    }

    public double getTotalUsageHours() {
        return totalUsageHours;
    }

    public void setTotalUsageHours(double totalUsageHours) {
        this.totalUsageHours = totalUsageHours;
    }

    public double getTotalAvailableHours() {
        return totalAvailableHours;
    }

    public void setTotalAvailableHours(double totalAvailableHours) {
        this.totalAvailableHours = totalAvailableHours;
    }

    public double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(double utilizationPercentage) {
        this.utilizationPercentage = utilizationPercentage;
    }

    public String getMostUsedEquipment() {
        return mostUsedEquipment;
    }

    public void setMostUsedEquipment(String mostUsedEquipment) {
        this.mostUsedEquipment = mostUsedEquipment;
    }
}
