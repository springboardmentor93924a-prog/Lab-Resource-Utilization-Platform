package com.labresource.dto.dashboard;

public class DashboardResponse {

    private long totalInstitutions;
    private long totalDepartments;
    private long totalEquipment;

    private long availableEquipment;
    private long bookedEquipment;
    private long underMaintenance;
    private long underCalibration;
    private long outOfService;

    private long totalBookings;
    private long totalMaintenanceRecords;
    private long totalCalibrationRecords;

    public DashboardResponse() {
    }

    public DashboardResponse(
            long totalInstitutions,
            long totalDepartments,
            long totalEquipment,
            long availableEquipment,
            long bookedEquipment,
            long underMaintenance,
            long underCalibration,
            long outOfService,
            long totalBookings,
            long totalMaintenanceRecords,
            long totalCalibrationRecords
    ) {
        this.totalInstitutions = totalInstitutions;
        this.totalDepartments = totalDepartments;
        this.totalEquipment = totalEquipment;
        this.availableEquipment = availableEquipment;
        this.bookedEquipment = bookedEquipment;
        this.underMaintenance = underMaintenance;
        this.underCalibration = underCalibration;
        this.outOfService = outOfService;
        this.totalBookings = totalBookings;
        this.totalMaintenanceRecords = totalMaintenanceRecords;
        this.totalCalibrationRecords = totalCalibrationRecords;
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

    public long getTotalEquipment() {
        return totalEquipment;
    }

    public void setTotalEquipment(long totalEquipment) {
        this.totalEquipment = totalEquipment;
    }

    public long getAvailableEquipment() {
        return availableEquipment;
    }

    public void setAvailableEquipment(long availableEquipment) {
        this.availableEquipment = availableEquipment;
    }

    public long getBookedEquipment() {
        return bookedEquipment;
    }

    public void setBookedEquipment(long bookedEquipment) {
        this.bookedEquipment = bookedEquipment;
    }

    public long getUnderMaintenance() {
        return underMaintenance;
    }

    public void setUnderMaintenance(long underMaintenance) {
        this.underMaintenance = underMaintenance;
    }

    public long getUnderCalibration() {
        return underCalibration;
    }

    public void setUnderCalibration(long underCalibration) {
        this.underCalibration = underCalibration;
    }

    public long getOutOfService() {
        return outOfService;
    }

    public void setOutOfService(long outOfService) {
        this.outOfService = outOfService;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getTotalMaintenanceRecords() {
        return totalMaintenanceRecords;
    }

    public void setTotalMaintenanceRecords(long totalMaintenanceRecords) {
        this.totalMaintenanceRecords = totalMaintenanceRecords;
    }

    public long getTotalCalibrationRecords() {
        return totalCalibrationRecords;
    }

    public void setTotalCalibrationRecords(long totalCalibrationRecords) {
        this.totalCalibrationRecords = totalCalibrationRecords;
    }
}