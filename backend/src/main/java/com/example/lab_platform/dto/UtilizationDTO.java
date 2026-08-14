package com.example.lab_platform.dto;

public class UtilizationDTO {

    private String equipmentName;

    private double usedHours;

    private double idleHours;

    private double utilizationPercentage;

    private String category;

    private long idleDays;

    private String monday;

    private String tuesday;

    private String wednesday;

    private String thursday;

    private String friday;

    // ===== NEW: demand analysis fields =====
    private long bookingCount;

    private long waitlistCount;

    public UtilizationDTO() {
    }

    public UtilizationDTO(
            String equipmentName,
            double usedHours,
            double idleHours,
            double utilizationPercentage,
            String category) {

        this.equipmentName = equipmentName;
        this.usedHours = usedHours;
        this.idleHours = idleHours;
        this.utilizationPercentage = utilizationPercentage;
        this.category = category;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public double getUsedHours() {
        return usedHours;
    }

    public void setUsedHours(double usedHours) {
        this.usedHours = usedHours;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public long getIdleDays() {
        return idleDays;
    }

    public void setIdleDays(long idleDays) {
        this.idleDays = idleDays;
    }

    public String getMonday() {
        return monday;
    }

    public void setMonday(String monday) {
        this.monday = monday;
    }

    public String getTuesday() {
        return tuesday;
    }

    public void setTuesday(String tuesday) {
        this.tuesday = tuesday;
    }

    public String getWednesday() {
        return wednesday;
    }

    public void setWednesday(String wednesday) {
        this.wednesday = wednesday;
    }

    public String getThursday() {
        return thursday;
    }

    public void setThursday(String thursday) {
        this.thursday = thursday;
    }

    public String getFriday() {
        return friday;
    }

    public void setFriday(String friday) {
        this.friday = friday;
    }

    // ===== NEW: demand analysis getters/setters =====
    public long getBookingCount() {
        return bookingCount;
    }

    public void setBookingCount(long bookingCount) {
        this.bookingCount = bookingCount;
    }

    public long getWaitlistCount() {
        return waitlistCount;
    }

    public void setWaitlistCount(long waitlistCount) {
        this.waitlistCount = waitlistCount;
    }
}