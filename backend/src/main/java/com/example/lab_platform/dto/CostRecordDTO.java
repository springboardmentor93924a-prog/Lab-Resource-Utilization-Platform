package com.example.lab_platform.dto;

import java.time.LocalDateTime;

public class CostRecordDTO {

    private Integer usageCostId;
    private Integer equipmentId;
    private String equipmentName;
    private Integer bookingId;
    private Integer userId;
    private String userName;
    private String departmentName;
    private LocalDateTime usageStart;
    private LocalDateTime usageEnd;
    private double usageHours;
    private double ratePerHour;
    private double totalCost;
    private String costStatus;

    public Integer getUsageCostId() {
        return usageCostId;
    }

    public void setUsageCostId(Integer usageCostId) {
        this.usageCostId = usageCostId;
    }

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

    public Integer getBookingId() {
        return bookingId;
    }

    public void setBookingId(Integer bookingId) {
        this.bookingId = bookingId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public LocalDateTime getUsageStart() {
        return usageStart;
    }

    public void setUsageStart(LocalDateTime usageStart) {
        this.usageStart = usageStart;
    }

    public LocalDateTime getUsageEnd() {
        return usageEnd;
    }

    public void setUsageEnd(LocalDateTime usageEnd) {
        this.usageEnd = usageEnd;
    }

    public double getUsageHours() {
        return usageHours;
    }

    public void setUsageHours(double usageHours) {
        this.usageHours = usageHours;
    }

    public double getRatePerHour() {
        return ratePerHour;
    }

    public void setRatePerHour(double ratePerHour) {
        this.ratePerHour = ratePerHour;
    }

    public double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(double totalCost) {
        this.totalCost = totalCost;
    }

    public String getCostStatus() {
        return costStatus;
    }

    public void setCostStatus(String costStatus) {
        this.costStatus = costStatus;
    }
}