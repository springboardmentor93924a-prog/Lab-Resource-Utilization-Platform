 package com.example.lab_platform.dto;

public class UtilizationSummaryDTO {

    private long totalEquipment;
    private double averageUtilization;
    private String mostRequestedEquipment;
    private String highestUtilizationEquipment;
    private String lowestUtilizationEquipment;

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
}