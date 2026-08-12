package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "equipment_id")
    private Integer equipmentId;

    @Column(name = "asset_tag", nullable = false, unique = true)
    private String assetTag;

    @Column(name = "name", nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private EquipmentCategory category;

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "manufacturer")
    private String manufacturer;

    @Column(name = "model_number")
    private String modelNumber;

    @Column(name = "specifications")
    private String specifications;

    @Column(name = "location")
    private String location;

    @Column(name = "manual_url")
    private String manualUrl;

    @Column(name = "calibration_cert_url")
    private String calibrationCertUrl;

    @Column(name = "calibration_due_date")
    private LocalDate calibrationDueDate;

    @Column(name = "tags")
    private String tags;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "shared_available")
    private Boolean sharedAvailable = false;

    public Integer getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Integer equipmentId) { this.equipmentId = equipmentId; }
    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public EquipmentCategory getCategory() { return category; }
    public void setCategory(EquipmentCategory category) { this.category = category; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }
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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Boolean getSharedAvailable() { return sharedAvailable; }
    public void setSharedAvailable(Boolean sharedAvailable) { this.sharedAvailable = sharedAvailable; }
}