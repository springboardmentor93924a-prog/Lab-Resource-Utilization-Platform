package com.labresource.dto;

import java.time.LocalDate;

public class UtilizationReportResponse {

    private LocalDate startDate;
    private LocalDate endDate;

    private long totalEquipment;
    private long totalBookings;

    private double averageUtilization;

    private EquipmentUtilizationSummary highestUtilizedEquipment;
    private EquipmentUtilizationSummary lowestUtilizedEquipment;

    private long highDemandEquipment;
    private long mediumDemandEquipment;
    private long lowDemandEquipment;

    public UtilizationReportResponse() {
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public long getTotalEquipment() {
        return totalEquipment;
    }

    public void setTotalEquipment(long totalEquipment) {
        this.totalEquipment = totalEquipment;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public double getAverageUtilization() {
        return averageUtilization;
    }

    public void setAverageUtilization(double averageUtilization) {
        this.averageUtilization = averageUtilization;
    }

    public EquipmentUtilizationSummary getHighestUtilizedEquipment() {
        return highestUtilizedEquipment;
    }

    public void setHighestUtilizedEquipment(
            EquipmentUtilizationSummary highestUtilizedEquipment) {

        this.highestUtilizedEquipment =
                highestUtilizedEquipment;
    }

    public EquipmentUtilizationSummary getLowestUtilizedEquipment() {
        return lowestUtilizedEquipment;
    }

    public void setLowestUtilizedEquipment(
            EquipmentUtilizationSummary lowestUtilizedEquipment) {

        this.lowestUtilizedEquipment =
                lowestUtilizedEquipment;
    }

    public long getHighDemandEquipment() {
        return highDemandEquipment;
    }

    public void setHighDemandEquipment(long highDemandEquipment) {
        this.highDemandEquipment = highDemandEquipment;
    }

    public long getMediumDemandEquipment() {
        return mediumDemandEquipment;
    }

    public void setMediumDemandEquipment(long mediumDemandEquipment) {
        this.mediumDemandEquipment = mediumDemandEquipment;
    }

    public long getLowDemandEquipment() {
        return lowDemandEquipment;
    }

    public void setLowDemandEquipment(long lowDemandEquipment) {
        this.lowDemandEquipment = lowDemandEquipment;
    }

    // =========================================================
    // INNER SUMMARY CLASS
    // =========================================================

    public static class EquipmentUtilizationSummary {

        private Long equipmentId;
        private String equipmentName;
        private String assetTag;
        private double utilizationPercentage;

        public EquipmentUtilizationSummary() {
        }

        public EquipmentUtilizationSummary(
                Long equipmentId,
                String equipmentName,
                String assetTag,
                double utilizationPercentage) {

            this.equipmentId = equipmentId;
            this.equipmentName = equipmentName;
            this.assetTag = assetTag;
            this.utilizationPercentage =
                    utilizationPercentage;
        }

        public Long getEquipmentId() {
            return equipmentId;
        }

        public void setEquipmentId(Long equipmentId) {
            this.equipmentId = equipmentId;
        }

        public String getEquipmentName() {
            return equipmentName;
        }

        public void setEquipmentName(String equipmentName) {
            this.equipmentName = equipmentName;
        }

        public String getAssetTag() {
            return assetTag;
        }

        public void setAssetTag(String assetTag) {
            this.assetTag = assetTag;
        }

        public double getUtilizationPercentage() {
            return utilizationPercentage;
        }

        public void setUtilizationPercentage(
                double utilizationPercentage) {

            this.utilizationPercentage =
                    utilizationPercentage;
        }
    }
}