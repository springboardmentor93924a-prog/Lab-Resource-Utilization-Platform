package com.labresource.dto;

public class SystemMonitoringResponseDto {
    private long totalUsers;
    private long totalEquipment;
    private long totalBookings;
    private long totalMaintenanceRecords;
    private long totalNotifications;

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getTotalEquipment() { return totalEquipment; }
    public void setTotalEquipment(long totalEquipment) { this.totalEquipment = totalEquipment; }
    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }
    public long getTotalMaintenanceRecords() { return totalMaintenanceRecords; }
    public void setTotalMaintenanceRecords(long totalMaintenanceRecords) { this.totalMaintenanceRecords = totalMaintenanceRecords; }
    public long getTotalNotifications() { return totalNotifications; }
    public void setTotalNotifications(long totalNotifications) { this.totalNotifications = totalNotifications; }
}
