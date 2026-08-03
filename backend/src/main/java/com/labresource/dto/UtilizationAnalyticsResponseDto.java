package com.labresource.dto;

public class UtilizationAnalyticsResponseDto {

    private String equipmentId;
    private String equipmentName;

    private Long totalUsageMinutes;
    private Long availableMinutes;
    private Long idleMinutes;

    private Double utilizationRate;

    private Long totalBookings;
    private Long totalRequests;

    public UtilizationAnalyticsResponseDto() {
    }

    public String getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(String equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public Long getTotalUsageMinutes() {
        return totalUsageMinutes;
    }

    public void setTotalUsageMinutes(Long totalUsageMinutes) {
        this.totalUsageMinutes = totalUsageMinutes;
    }

    public Long getAvailableMinutes() {
        return availableMinutes;
    }

    public void setAvailableMinutes(Long availableMinutes) {
        this.availableMinutes = availableMinutes;
    }

    public Long getIdleMinutes() {
        return idleMinutes;
    }

    public void setIdleMinutes(Long idleMinutes) {
        this.idleMinutes = idleMinutes;
    }

    public Double getUtilizationRate() {
        return utilizationRate;
    }

    public void setUtilizationRate(Double utilizationRate) {
        this.utilizationRate = utilizationRate;
    }

    public Long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(Long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public Long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(Long totalRequests) {
        this.totalRequests = totalRequests;
    }
}

//{
//  "equipmentId": "eq123",
//  "equipmentName": "Microscope",
//  "totalUsageMinutes": 5400,
//  "availableMinutes": 7200,
//  "idleMinutes": 1800,
//  "utilizationRate": 75.0,
//  "totalBookings": 20,
//  "totalRequests": 28
//}