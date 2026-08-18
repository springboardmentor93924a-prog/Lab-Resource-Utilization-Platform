package com.labplatform.equipment.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class EquipmentRequest {

    @NotBlank(message = "Equipment name is required")
    private String equipmentName;

    @NotBlank(message = "Asset tag is required")
    private String assetTag;

    private String category;

    private String department;

    private String manufacturer;

    private String model;

    private String imageUrl;

    private String status;

    /*
     * Existing field - kept for backward compatibility.
     */
    private LocalDate calibrationDueDate;

    /*
     * Calibration tracking
     */
    private LocalDate lastCalibrationDate;

    private LocalDate nextCalibrationDate;

    /*
     * Certification tracking
     */
    private String certificationDetails;

    private LocalDate certificationExpiryDate;

    private String manualDocument;

    private String calibrationCertificate;

    private Integer institutionId;

    private java.math.BigDecimal hourlyRate;

    public EquipmentRequest() {
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getCalibrationDueDate() {
        return calibrationDueDate;
    }

    public void setCalibrationDueDate(LocalDate calibrationDueDate) {
        this.calibrationDueDate = calibrationDueDate;
    }

    public LocalDate getLastCalibrationDate() {
        return lastCalibrationDate;
    }

    public void setLastCalibrationDate(LocalDate lastCalibrationDate) {
        this.lastCalibrationDate = lastCalibrationDate;
    }

    public LocalDate getNextCalibrationDate() {
        return nextCalibrationDate;
    }

    public void setNextCalibrationDate(LocalDate nextCalibrationDate) {
        this.nextCalibrationDate = nextCalibrationDate;
    }

    public String getCertificationDetails() {
        return certificationDetails;
    }

    public void setCertificationDetails(String certificationDetails) {
        this.certificationDetails = certificationDetails;
    }

    public LocalDate getCertificationExpiryDate() {
        return certificationExpiryDate;
    }

    public void setCertificationExpiryDate(LocalDate certificationExpiryDate) {
        this.certificationExpiryDate = certificationExpiryDate;
    }

    public String getManualDocument() {
        return manualDocument;
    }

    public void setManualDocument(String manualDocument) {
        this.manualDocument = manualDocument;
    }

    public String getCalibrationCertificate() {
        return calibrationCertificate;
    }

    public void setCalibrationCertificate(String calibrationCertificate) {
        this.calibrationCertificate = calibrationCertificate;
    }

    public Integer getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(Integer institutionId) {
        this.institutionId = institutionId;
    }

    public java.math.BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(java.math.BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }
}