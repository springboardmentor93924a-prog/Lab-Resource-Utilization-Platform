package com.labplatform.equipment.dto;

import java.math.BigDecimal;

public class UtilizationCostReportRow {

    private Long equipmentId;
    private String equipmentName;
    private String category;
    private Integer totalBookings;
    private Integer usageHours;
    private Double utilizationRate;
    private BigDecimal totalCost;

    public UtilizationCostReportRow() {
    }

    public UtilizationCostReportRow(Long equipmentId, String equipmentName, String category,
                                    Integer totalBookings, Integer usageHours, Double utilizationRate,
                                    BigDecimal totalCost) {
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.category = category;
        this.totalBookings = totalBookings;
        this.usageHours = usageHours;
        this.utilizationRate = utilizationRate;
        this.totalCost = totalCost;
    }

    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getTotalBookings() { return totalBookings; }
    public void setTotalBookings(Integer totalBookings) { this.totalBookings = totalBookings; }

    public Integer getUsageHours() { return usageHours; }
    public void setUsageHours(Integer usageHours) { this.usageHours = usageHours; }

    public Double getUtilizationRate() { return utilizationRate; }
    public void setUtilizationRate(Double utilizationRate) { this.utilizationRate = utilizationRate; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
}