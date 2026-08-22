package com.labplatform.equipment.dto;

import com.labplatform.equipment.model.Equipment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class EquipmentResponse {

    private Long id;
    private String equipmentName;
    private String assetTag;
    private String category;
    private String department;
    private String manufacturer;
    private String model;
    private String imageUrl;
    private String status;

    // Calibration
    private LocalDate calibrationDueDate;
    private LocalDate lastCalibrationDate;
    private LocalDate nextCalibrationDate;

    // Certification
    private String certificationDetails;
    private LocalDate certificationExpiryDate;

    private String manualDocument;
    private String calibrationCertificate;

    private LocalDateTime createdAt;

    // Institution
    private Integer institutionId;
    private String institutionName;

    // Usage cost
    private BigDecimal hourlyRate;

    // =========================================================
    // PROCUREMENT
    // =========================================================

    private String supplier;
    private LocalDate purchaseDate;
    private BigDecimal purchaseCost;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public EquipmentResponse() {
    }

    public EquipmentResponse(Equipment equipment) {

        this.id = equipment.getId();

        this.equipmentName =
                equipment.getEquipmentName();

        this.assetTag =
                equipment.getAssetTag();

        this.category =
                equipment.getCategory();

        this.department =
                equipment.getDepartment();

        this.manufacturer =
                equipment.getManufacturer();

        this.model =
                equipment.getModel();

        this.imageUrl =
                equipment.getImageUrl();

        this.status =
                equipment.getStatus() != null
                        ? equipment.getStatus().name()
                        : null;

        // =====================================================
        // CALIBRATION
        // =====================================================

        this.calibrationDueDate =
                equipment.getCalibrationDueDate();

        this.lastCalibrationDate =
                equipment.getLastCalibrationDate();

        this.nextCalibrationDate =
                equipment.getNextCalibrationDate();

        // =====================================================
        // CERTIFICATION
        // =====================================================

        this.certificationDetails =
                equipment.getCertificationDetails();

        this.certificationExpiryDate =
                equipment.getCertificationExpiryDate();

        // =====================================================
        // DOCUMENTS
        // =====================================================

        this.manualDocument =
                equipment.getManualDocument();

        this.calibrationCertificate =
                equipment.getCalibrationCertificate();

        // =====================================================
        // CREATED DATE
        // =====================================================

        this.createdAt =
                equipment.getCreatedAt();

        // =====================================================
        // INSTITUTION
        // =====================================================

        if (equipment.getInstitution() != null) {

            this.institutionId =
                    equipment.getInstitution().getId();

            this.institutionName =
                    equipment.getInstitution().getName();

        } else {

            this.institutionId = null;
            this.institutionName = null;
        }

        // =====================================================
        // HOURLY RATE
        // =====================================================

        this.hourlyRate =
                equipment.getHourlyRate();

        // =====================================================
        // PROCUREMENT
        // =====================================================

        this.supplier =
                equipment.getSupplier();

        this.purchaseDate =
                equipment.getPurchaseDate();

        this.purchaseCost =
                equipment.getPurchaseCost();
    }

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

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

    public void setCertificationExpiryDate(
            LocalDate certificationExpiryDate) {

        this.certificationExpiryDate =
                certificationExpiryDate;
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

    public void setCalibrationCertificate(
            String calibrationCertificate) {

        this.calibrationCertificate =
                calibrationCertificate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(Integer institutionId) {
        this.institutionId = institutionId;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    // =========================================================
    // PROCUREMENT GETTERS / SETTERS
    // =========================================================

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public BigDecimal getPurchaseCost() {
        return purchaseCost;
    }

    public void setPurchaseCost(BigDecimal purchaseCost) {
        this.purchaseCost = purchaseCost;
    }
}