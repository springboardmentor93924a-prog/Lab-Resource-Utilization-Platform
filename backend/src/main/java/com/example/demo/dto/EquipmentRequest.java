package com.example.demo.dto;

import java.time.LocalDate;

public class EquipmentRequest {
    private String assetTag;
    private String name;
    private Integer categoryId;
    private Integer departmentId;
    private Integer institutionId;
    private String status;
    private String manufacturer;
    private String modelNumber;
    private String specifications;
    private String location;
    private String manualUrl;
    private String calibrationCertUrl;
    private LocalDate calibrationDueDate;
    private String tags;

    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }
    public Integer getDepartmentId() { return departmentId; }
    public void setDepartmentId(Integer departmentId) { this.departmentId = departmentId; }
    public Integer getInstitutionId() { return institutionId; }
    public void setInstitutionId(Integer institutionId) { this.institutionId = institutionId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }
    public String getModelNumber() { return modelNumber; }
    public void setModelNumber(String modelNumber) { this.modelNumber = modelNumber; }
    public String getSpecifications() { return specifications; }
    public void setSpecifications(String specifications) { this.specifications = specifications; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getManualUrl() { return manualUrl; }
    public void setManualUrl(String manualUrl) { this.manualUrl = manualUrl; }
    public String getCalibrationCertUrl() { return calibrationCertUrl; }
    public void setCalibrationCertUrl(String calibrationCertUrl) { this.calibrationCertUrl = calibrationCertUrl; }
    public LocalDate getCalibrationDueDate() { return calibrationDueDate; }
    public void setCalibrationDueDate(LocalDate calibrationDueDate) { this.calibrationDueDate = calibrationDueDate; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
}