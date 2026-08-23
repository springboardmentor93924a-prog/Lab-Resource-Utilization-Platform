package com.example.lab_platform.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsDashboardDTO {

    // ----- Equipment / utilization (built on Task 1 & Task 2 data) -----
    private long totalEquipment;
    private double averageUtilization;
    private String mostRequestedEquipment;
    private String highestUtilizationEquipment;
    private String lowestUtilizationEquipment;
    private List<UtilizationDTO> topUtilizedEquipment;

    // ----- Cost (built on Task 3 data) -----
    private double totalCost;
    private double pendingCost;
    private double paidCost;
    private String mostExpensiveEquipment;
    private List<EquipmentCostDTO> topEquipmentByCost;
    private List<DepartmentCostDTO> costByDepartment;
    private List<MonthlyCostDTO> monthlyCostTrend;

    // ----- Bookings -----
    private long totalBookings;
    private Map<String, Long> bookingStatusBreakdown;
    private List<BookingTrendDTO> monthlyBookingTrend;

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

    public String getMostRequestedEquipment() {
        return mostRequestedEquipment;
    }

    public void setMostRequestedEquipment(String mostRequestedEquipment) {
        this.mostRequestedEquipment = mostRequestedEquipment;
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

    public List<UtilizationDTO> getTopUtilizedEquipment() {
        return topUtilizedEquipment;
    }

    public void setTopUtilizedEquipment(List<UtilizationDTO> topUtilizedEquipment) {
        this.topUtilizedEquipment = topUtilizedEquipment;
    }

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

    public String getMostExpensiveEquipment() {
        return mostExpensiveEquipment;
    }

    public void setMostExpensiveEquipment(String mostExpensiveEquipment) {
        this.mostExpensiveEquipment = mostExpensiveEquipment;
    }

    public List<EquipmentCostDTO> getTopEquipmentByCost() {
        return topEquipmentByCost;
    }

    public void setTopEquipmentByCost(List<EquipmentCostDTO> topEquipmentByCost) {
        this.topEquipmentByCost = topEquipmentByCost;
    }

    public List<DepartmentCostDTO> getCostByDepartment() {
        return costByDepartment;
    }

    public void setCostByDepartment(List<DepartmentCostDTO> costByDepartment) {
        this.costByDepartment = costByDepartment;
    }

    public List<MonthlyCostDTO> getMonthlyCostTrend() {
        return monthlyCostTrend;
    }

    public void setMonthlyCostTrend(List<MonthlyCostDTO> monthlyCostTrend) {
        this.monthlyCostTrend = monthlyCostTrend;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public Map<String, Long> getBookingStatusBreakdown() {
        return bookingStatusBreakdown;
    }

    public void setBookingStatusBreakdown(Map<String, Long> bookingStatusBreakdown) {
        this.bookingStatusBreakdown = bookingStatusBreakdown;
    }

    public List<BookingTrendDTO> getMonthlyBookingTrend() {
        return monthlyBookingTrend;
    }

    public void setMonthlyBookingTrend(List<BookingTrendDTO> monthlyBookingTrend) {
        this.monthlyBookingTrend = monthlyBookingTrend;
    }
}
