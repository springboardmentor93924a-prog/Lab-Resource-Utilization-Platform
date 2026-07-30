package com.labresource.dto.calibration;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class CalibrationResponse {

    private String id;
    private String equipmentId;
    private String equipmentName;
    private String technicianId;
    private String technicianName;
    private LocalDate calibrationDate;
    private LocalDate nextCalibrationDate;
    private String calibrationResult;
    private String certificateUrl;
    private String remarks;
    private String status;
    private LocalDateTime createdAt;

    public CalibrationResponse() {
    }

    public CalibrationResponse(
            String id,
            String equipmentId,
            String equipmentName,
            String technicianId,
            String technicianName,
            LocalDate calibrationDate,
            LocalDate nextCalibrationDate,
            String calibrationResult,
            String certificateUrl,
            String remarks,
            String status,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.technicianId = technicianId;
        this.technicianName = technicianName;
        this.calibrationDate = calibrationDate;
        this.nextCalibrationDate = nextCalibrationDate;
        this.calibrationResult = calibrationResult;
        this.certificateUrl = certificateUrl;
        this.remarks = remarks;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(String technicianId) {
        this.technicianId = technicianId;
    }

    public String getTechnicianName() {
        return technicianName;
    }

    public void setTechnicianName(String technicianName) {
        this.technicianName = technicianName;
    }

    public LocalDate getCalibrationDate() {
        return calibrationDate;
    }

    public void setCalibrationDate(LocalDate calibrationDate) {
        this.calibrationDate = calibrationDate;
    }

    public LocalDate getNextCalibrationDate() {
        return nextCalibrationDate;
    }

    public void setNextCalibrationDate(LocalDate nextCalibrationDate) {
        this.nextCalibrationDate = nextCalibrationDate;
    }

    public String getCalibrationResult() {
        return calibrationResult;
    }

    public void setCalibrationResult(String calibrationResult) {
        this.calibrationResult = calibrationResult;
    }

    public String getCertificateUrl() {
        return certificateUrl;
    }

    public void setCertificateUrl(String certificateUrl) {
        this.certificateUrl = certificateUrl;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}