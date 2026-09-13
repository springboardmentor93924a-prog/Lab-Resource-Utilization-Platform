
package com.labresource.dto;

import java.time.LocalDate;

public class UtilizationHeatmapDTO {

    private Long equipmentId;
    private String equipmentName;
    private LocalDate date;
    private Double usageHours;
    private Double utilizationPercentage;

    public UtilizationHeatmapDTO() {
    }

    public UtilizationHeatmapDTO(
            Long equipmentId,
            String equipmentName,
            LocalDate date,
            Double usageHours,
            Double utilizationPercentage
    ) {
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.date = date;
        this.usageHours = usageHours;
        this.utilizationPercentage = utilizationPercentage;
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

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Double getUsageHours() {
        return usageHours;
    }

    public void setUsageHours(Double usageHours) {
        this.usageHours = usageHours;
    }

    public Double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(Double utilizationPercentage) {
        this.utilizationPercentage = utilizationPercentage;
    }
}
