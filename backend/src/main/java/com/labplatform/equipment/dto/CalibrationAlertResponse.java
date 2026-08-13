package com.labplatform.equipment.dto;

import java.time.LocalDate;

public class CalibrationAlertResponse {

    private Long equipmentId;
    private String equipmentName;
    private String category;
    private LocalDate calibrationDueDate;
    private Integer daysUntilDue;
    private String urgency;

    public CalibrationAlertResponse() {
    }

    public CalibrationAlertResponse(Long equipmentId, String equipmentName, String category,
                                    LocalDate calibrationDueDate, Integer daysUntilDue, String urgency) {
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.category = category;
        this.calibrationDueDate = calibrationDueDate;
        this.daysUntilDue = daysUntilDue;
        this.urgency = urgency;
    }

    public Long getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Long equipmentId) { this.equipmentId = equipmentId; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public LocalDate getCalibrationDueDate() { return calibrationDueDate; }
    public void setCalibrationDueDate(LocalDate calibrationDueDate) { this.calibrationDueDate = calibrationDueDate; }

    public Integer getDaysUntilDue() { return daysUntilDue; }
    public void setDaysUntilDue(Integer daysUntilDue) { this.daysUntilDue = daysUntilDue; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
}