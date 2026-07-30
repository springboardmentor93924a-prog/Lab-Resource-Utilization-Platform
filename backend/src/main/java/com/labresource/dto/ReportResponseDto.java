package com.labresource.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReportResponseDto {

    private String reportType;
    private LocalDateTime generatedAt;

    /*
     * Equipment summary
     */
    private long totalEquipments;
    private long availableEquipments;
    private long bookedEquipments;
    private long maintenanceEquipments;
    private long unavailableEquipments;

    /*
     * Booking summary
     */
    private long totalBookings;
    private long approvedBookings;
    private long pendingBookings;
    private long rejectedBookings;
    private long cancelledBookings;
    private long completedBookings;

    /*
     * Maintenance and calibration summary
     */
    private long totalMaintenanceRecords;
    private long pendingMaintenanceRecords;
    private long completedMaintenanceRecords;

    private long totalCalibrationRecords;
    private long pendingCalibrationRecords;
    private long completedCalibrationRecords;

    /*
     * Institution and user summary
     */
    private long totalInstitutions;
    private long totalDepartments;
    private long totalUsers;

    /*
     * External resource-sharing summary
     */
    private long totalExternalBookings;
    private long totalResourceSharingRequests;

    /*
     * Financial summary
     */
    private BigDecimal totalRevenue;
    private BigDecimal totalCost;
    private BigDecimal profit;

    private long totalBills;
    private long paidBills;
    private long pendingBills;
    private long overdueBills;

    public ReportResponseDto() {
        this.generatedAt = LocalDateTime.now();
        this.totalRevenue = BigDecimal.ZERO;
        this.totalCost = BigDecimal.ZERO;
        this.profit = BigDecimal.ZERO;
    }

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public long getTotalEquipments() {
        return totalEquipments;
    }

    public void setTotalEquipments(long totalEquipments) {
        this.totalEquipments = totalEquipments;
    }

    public long getAvailableEquipments() {
        return availableEquipments;
    }

    public void setAvailableEquipments(long availableEquipments) {
        this.availableEquipments = availableEquipments;
    }

    public long getBookedEquipments() {
        return bookedEquipments;
    }

    public void setBookedEquipments(long bookedEquipments) {
        this.bookedEquipments = bookedEquipments;
    }

    public long getMaintenanceEquipments() {
        return maintenanceEquipments;
    }

    public void setMaintenanceEquipments(long maintenanceEquipments) {
        this.maintenanceEquipments = maintenanceEquipments;
    }

    public long getUnavailableEquipments() {
        return unavailableEquipments;
    }

    public void setUnavailableEquipments(long unavailableEquipments) {
        this.unavailableEquipments = unavailableEquipments;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getApprovedBookings() {
        return approvedBookings;
    }

    public void setApprovedBookings(long approvedBookings) {
        this.approvedBookings = approvedBookings;
    }

    public long getPendingBookings() {
        return pendingBookings;
    }

    public void setPendingBookings(long pendingBookings) {
        this.pendingBookings = pendingBookings;
    }

    public long getRejectedBookings() {
        return rejectedBookings;
    }

    public void setRejectedBookings(long rejectedBookings) {
        this.rejectedBookings = rejectedBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public long getCompletedBookings() {
        return completedBookings;
    }

    public void setCompletedBookings(long completedBookings) {
        this.completedBookings = completedBookings;
    }

    public long getTotalMaintenanceRecords() {
        return totalMaintenanceRecords;
    }

    public void setTotalMaintenanceRecords(long totalMaintenanceRecords) {
        this.totalMaintenanceRecords = totalMaintenanceRecords;
    }

    public long getPendingMaintenanceRecords() {
        return pendingMaintenanceRecords;
    }

    public void setPendingMaintenanceRecords(
            long pendingMaintenanceRecords
    ) {
        this.pendingMaintenanceRecords = pendingMaintenanceRecords;
    }

    public long getCompletedMaintenanceRecords() {
        return completedMaintenanceRecords;
    }

    public void setCompletedMaintenanceRecords(
            long completedMaintenanceRecords
    ) {
        this.completedMaintenanceRecords = completedMaintenanceRecords;
    }

    public long getTotalCalibrationRecords() {
        return totalCalibrationRecords;
    }

    public void setTotalCalibrationRecords(long totalCalibrationRecords) {
        this.totalCalibrationRecords = totalCalibrationRecords;
    }

    public long getPendingCalibrationRecords() {
        return pendingCalibrationRecords;
    }

    public void setPendingCalibrationRecords(
            long pendingCalibrationRecords
    ) {
        this.pendingCalibrationRecords = pendingCalibrationRecords;
    }

    public long getCompletedCalibrationRecords() {
        return completedCalibrationRecords;
    }

    public void setCompletedCalibrationRecords(
            long completedCalibrationRecords
    ) {
        this.completedCalibrationRecords = completedCalibrationRecords;
    }

    public long getTotalInstitutions() {
        return totalInstitutions;
    }

    public void setTotalInstitutions(long totalInstitutions) {
        this.totalInstitutions = totalInstitutions;
    }

    public long getTotalDepartments() {
        return totalDepartments;
    }

    public void setTotalDepartments(long totalDepartments) {
        this.totalDepartments = totalDepartments;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalExternalBookings() {
        return totalExternalBookings;
    }

    public void setTotalExternalBookings(long totalExternalBookings) {
        this.totalExternalBookings = totalExternalBookings;
    }

    public long getTotalResourceSharingRequests() {
        return totalResourceSharingRequests;
    }

    public void setTotalResourceSharingRequests(
            long totalResourceSharingRequests
    ) {
        this.totalResourceSharingRequests =
                totalResourceSharingRequests;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }

    public BigDecimal getProfit() {
        return profit;
    }

    public void setProfit(BigDecimal profit) {
        this.profit = profit;
    }

    public long getTotalBills() {
        return totalBills;
    }

    public void setTotalBills(long totalBills) {
        this.totalBills = totalBills;
    }

    public long getPaidBills() {
        return paidBills;
    }

    public void setPaidBills(long paidBills) {
        this.paidBills = paidBills;
    }

    public long getPendingBills() {
        return pendingBills;
    }

    public void setPendingBills(long pendingBills) {
        this.pendingBills = pendingBills;
    }

    public long getOverdueBills() {
        return overdueBills;
    }

    public void setOverdueBills(long overdueBills) {
        this.overdueBills = overdueBills;
    }
}