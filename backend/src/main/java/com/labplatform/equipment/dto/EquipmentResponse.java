package com.labplatform.equipment.dto;

import com.labplatform.equipment.model.Equipment;

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
    private LocalDate calibrationDueDate;
    private String manualDocument;
    private String calibrationCertificate;
    private LocalDateTime createdAt;
    private Integer institutionId;
    private String institutionName;

    public EquipmentResponse() {
    }

    public EquipmentResponse(Equipment equipment) {
        this.id = equipment.getId();
        this.equipmentName = equipment.getEquipmentName();
        this.assetTag = equipment.getAssetTag();
        this.category = equipment.getCategory();
        this.department = equipment.getDepartment();
        this.manufacturer = equipment.getManufacturer();
        this.model = equipment.getModel();
        this.imageUrl = equipment.getImageUrl();
        this.status = equipment.getStatus() != null ? equipment.getStatus().name() : null;
        this.calibrationDueDate = equipment.getCalibrationDueDate();
        this.manualDocument = equipment.getManualDocument();
        this.calibrationCertificate = equipment.getCalibrationCertificate();
        this.createdAt = equipment.getCreatedAt();
        this.institutionId = equipment.getInstitution() != null ? equipment.getInstitution().getId() : null;
        this.institutionName = equipment.getInstitution() != null ? equipment.getInstitution().getName() : null;
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
}