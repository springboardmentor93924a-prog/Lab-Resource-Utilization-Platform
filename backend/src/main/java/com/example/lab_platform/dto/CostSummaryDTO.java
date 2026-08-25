package com.example.lab_platform.dto;

import java.util.List;

public class CostSummaryDTO {

    private double totalCost;
    private double pendingCost;
    private double paidCost;
    private double waivedCost;
    private double totalBillableHours;
    private long totalUsageRecords;
    private double averageCostPerBooking;
    private String mostExpensiveEquipment;
    private List<EquipmentCostDTO> costByEquipment;
    private List<DepartmentCostDTO> costByDepartment;
    private List<MonthlyCostDTO> costByMonth;

    public double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(double totalCost) {
        this.totalCost = totalCost;
    }

    public double getPendingCost() {
        return pendingCost;
    }

    public void setPendingCost(double pendingCost) {
        this.pendingCost = pendingCost;
    }

    public double getPaidCost() {
        return paidCost;
    }

    public void setPaidCost(double paidCost) {
        this.paidCost = paidCost;
    }

    public double getWaivedCost() {
        return waivedCost;
    }

    public void setWaivedCost(double waivedCost) {
        this.waivedCost = waivedCost;
    }

    public double getTotalBillableHours() {
        return totalBillableHours;
    }

    public void setTotalBillableHours(double totalBillableHours) {
        this.totalBillableHours = totalBillableHours;
    }

    public long getTotalUsageRecords() {
        return totalUsageRecords;
    }

    public void setTotalUsageRecords(long totalUsageRecords) {
        this.totalUsageRecords = totalUsageRecords;
    }

    public double getAverageCostPerBooking() {
        return averageCostPerBooking;
    }

    public void setAverageCostPerBooking(double averageCostPerBooking) {
        this.averageCostPerBooking = averageCostPerBooking;
    }

    public String getMostExpensiveEquipment() {
        return mostExpensiveEquipment;
    }

    public void setMostExpensiveEquipment(String mostExpensiveEquipment) {
        this.mostExpensiveEquipment = mostExpensiveEquipment;
    }

    public List<EquipmentCostDTO> getCostByEquipment() {
        return costByEquipment;
    }

    public void setCostByEquipment(List<EquipmentCostDTO> costByEquipment) {
        this.costByEquipment = costByEquipment;
    }

    public List<DepartmentCostDTO> getCostByDepartment() {
        return costByDepartment;
    }

    public void setCostByDepartment(List<DepartmentCostDTO> costByDepartment) {
        this.costByDepartment = costByDepartment;
    }

    public List<MonthlyCostDTO> getCostByMonth() {
        return costByMonth;
    }

    public void setCostByMonth(List<MonthlyCostDTO> costByMonth) {
        this.costByMonth = costByMonth;
    }
}
