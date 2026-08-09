 package com.example.lab_platform.dto;

public class UtilizationDTO {

    private String equipmentName;
    private double usedHours;
    private double idleHours;
    private double utilizationPercentage;
    private String category;

    // 🔥 NEW FIELDS (ADD किए गए)
    private long idleDays;

    private String monday;
    private String tuesday;
    private String wednesday;
    private String thursday;
    private String friday;

    // ✅ OLD CONSTRUCTOR (UNCHANGED)
    public UtilizationDTO(String equipmentName, double usedHours, double idleHours, double utilizationPercentage, String category) {
        this.equipmentName = equipmentName;
        this.usedHours = usedHours;
        this.idleHours = idleHours;
        this.utilizationPercentage = utilizationPercentage;
        this.category = category;
    }

    // 🔥 NEW EMPTY CONSTRUCTOR (IMPORTANT)
    public UtilizationDTO() {
    }

    // ✅ OLD GETTERS (UNCHANGED)

    public String getEquipmentName() {
        return equipmentName;
    }

    public double getUsedHours() {
        return usedHours;
    }

    public double getIdleHours() {
        return idleHours;
    }

    public double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public String getCategory() {
        return category;
    }

    // 🔥 NEW GETTERS & SETTERS

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

    // OPTIONAL (अगर future में setters चाहिए)
    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public void setUsedHours(double usedHours) {
        this.usedHours = usedHours;
    }

    public void setIdleHours(double idleHours) {
        this.idleHours = idleHours;
    }

    public void setUtilizationPercentage(double utilizationPercentage) {
        this.utilizationPercentage = utilizationPercentage;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}