package com.labplatform.equipment.model;
import com.labplatform.institution.model.Institution;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String equipmentName;

    @Column(unique = true, nullable = false)
    private String assetTag;

    private String category;

    private String department;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    private String manufacturer;

    private String model;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipmentStatus status;

    private LocalDate calibrationDueDate;

    private String manualDocument;

    private String calibrationCertificate;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    public Equipment() {
    }

    public Equipment(String equipmentName, String assetTag, String category, String department,
                     String manufacturer, String model, String imageUrl, EquipmentStatus status,
                     LocalDate calibrationDueDate, String manualDocument, String calibrationCertificate) {
        this.equipmentName = equipmentName;
        this.assetTag = assetTag;
        this.category = category;
        this.department = department;
        this.manufacturer = manufacturer;
        this.model = model;
        this.imageUrl = imageUrl;
        this.status = status;
        this.calibrationDueDate = calibrationDueDate;
        this.manualDocument = manualDocument;
        this.calibrationCertificate = calibrationCertificate;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = EquipmentStatus.AVAILABLE;
        }
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

    public EquipmentStatus getStatus() {
        return status;
    }

    public void setStatus(EquipmentStatus status) {
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
    public Institution getInstitution() {
        return institution;
    }

    public void setInstitution(Institution institution) {
        this.institution = institution;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
