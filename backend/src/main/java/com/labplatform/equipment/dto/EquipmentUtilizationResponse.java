package com.labplatform.equipment.dto;

public class EquipmentUtilizationResponse {

    private Long id;
    private String equipmentName;
    private String category;
    private String status;
    private Integer totalBookings;
    private Integer usageHours;
    private Double utilizationRate;
    private Boolean highDemand;

    public EquipmentUtilizationResponse() {
    }

    public EquipmentUtilizationResponse(Long id, String equipmentName, String category, String status,
                                        Integer totalBookings, Integer usageHours, Double utilizationRate,
                                        Boolean highDemand) {
        this.id = id;
        this.equipmentName = equipmentName;
        this.category = category;
        this.status = status;
        this.totalBookings = totalBookings;
        this.usageHours = usageHours;
        this.utilizationRate = utilizationRate;
        this.highDemand = highDemand;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(Integer totalBookings) {
        this.totalBookings = totalBookings;
    }

    public Integer getUsageHours() {
        return usageHours;
    }

    public void setUsageHours(Integer usageHours) {
        this.usageHours = usageHours;
    }

    public Double getUtilizationRate() {
        return utilizationRate;
    }

    public void setUtilizationRate(Double utilizationRate) {
        this.utilizationRate = utilizationRate;
    }public Boolean getHighDemand() {
        return highDemand;
    }

    public void setHighDemand(Boolean highDemand) {
        this.highDemand = highDemand;
    }

}