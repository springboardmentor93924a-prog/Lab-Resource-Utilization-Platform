package com.example.lab_platform.dto;

public class EquipmentUtilizationRowDTO {

    private Integer equipmentId;
    private String equipmentName;
    private String category;
    private String departmentName;
    private String institutionName;
    private double totalAvailableHours;
    private double totalBookedHours;
    private double idleHours;
    private double utilizationPercentage;
    private long bookingCount;
    private String currentStatus;

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

    public double getTotalAvailableHours() {
        return totalAvailableHours;
    }

    public void setTotalAvailableHours(double totalAvailableHours) {
        this.totalAvailableHours = totalAvailableHours;
    }

    public double getTotalBookedHours() {
        return totalBookedHours;
    }

    public void setTotalBookedHours(double totalBookedHours) {
        this.totalBookedHours = totalBookedHours;
    }

    public double getIdleHours() {
        return idleHours;
    }

    public void setIdleHours(double idleHours) {
        this.idleHours = idleHours;
    }

    public double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(double utilizationPercentage) {
        this.utilizationPercentage = utilizationPercentage;
    }

    public long getBookingCount() {
        return bookingCount;
    }

    public void setBookingCount(long bookingCount) {
        this.bookingCount = bookingCount;
    }

    public String getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(String currentStatus) {
        this.currentStatus = currentStatus;
    }
}
