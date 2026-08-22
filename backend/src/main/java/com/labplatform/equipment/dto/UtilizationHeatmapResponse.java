package com.labplatform.equipment.dto;

import java.util.List;

public class UtilizationHeatmapResponse {

    private Long equipmentId;
    private String equipmentName;
    private String category;
    private double averageUtilization;
    private List<DailyUtilization> dailyUtilization;

    public UtilizationHeatmapResponse() {
    }

    public UtilizationHeatmapResponse(
            Long equipmentId,
            String equipmentName,
            String category,
            double averageUtilization,
            List<DailyUtilization> dailyUtilization) {

        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.category = category;
        this.averageUtilization = averageUtilization;
        this.dailyUtilization = dailyUtilization;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getAverageUtilization() {
        return averageUtilization;
    }

    public void setAverageUtilization(double averageUtilization) {
        this.averageUtilization = averageUtilization;
    }

    public List<DailyUtilization> getDailyUtilization() {
        return dailyUtilization;
    }

    public void setDailyUtilization(List<DailyUtilization> dailyUtilization) {
        this.dailyUtilization = dailyUtilization;
    }

    public static class DailyUtilization {

        private String date;
        private double utilization;
        private int usageHours;
        private int bookings;

        public DailyUtilization() {
        }

        public DailyUtilization(
                String date,
                double utilization,
                int usageHours,
                int bookings) {

            this.date = date;
            this.utilization = utilization;
            this.usageHours = usageHours;
            this.bookings = bookings;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public double getUtilization() {
            return utilization;
        }

        public void setUtilization(double utilization) {
            this.utilization = utilization;
        }

        public int getUsageHours() {
            return usageHours;
        }

        public void setUsageHours(int usageHours) {
            this.usageHours = usageHours;
        }

        public int getBookings() {
            return bookings;
        }

        public void setBookings(int bookings) {
            this.bookings = bookings;
        }
    }
}