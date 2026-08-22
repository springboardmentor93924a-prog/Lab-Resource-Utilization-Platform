package com.labplatform.equipment.model;

import com.labplatform.institution.model.Institution;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
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

    @Column(name = "hourly_rate")
    private BigDecimal hourlyRate;

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

    private LocalDate lastCalibrationDate;

    private LocalDate nextCalibrationDate;

    private String certificationDetails;

    private LocalDate certificationExpiryDate;

    /*
     * ============================================================
     * PROCUREMENT INFORMATION
     * ============================================================
     */

    @Column(name = "supplier")
    private String supplier;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "purchase_cost")
    private BigDecimal purchaseCost;

    /*
     * ============================================================
     * CREATED DATE
     * ============================================================
     */

    @Column(updatable = false)
    private LocalDateTime createdAt;

    /*
     * ============================================================
     * CONSTRUCTORS
     * ============================================================
     */

    public Equipment() {
    }

    public Equipment(
            String equipmentName,
            String assetTag,
            String category,
            String department,
            String manufacturer,
            String model,
            String imageUrl,
            EquipmentStatus status,
            LocalDate calibrationDueDate,
            String manualDocument,
            String calibrationCertificate) {

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

    /*
     * ============================================================
     * PRE-PERSIST
     * ============================================================
     */

    @PrePersist
    protected void onCreate() {

        this.createdAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = EquipmentStatus.AVAILABLE;
        }
    }

    /*
     * ============================================================
     * ID
     * ============================================================
     */

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    /*
     * ============================================================
     * EQUIPMENT NAME
     * ============================================================
     */

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    /*
     * ============================================================
     * ASSET TAG
     * ============================================================
     */

    public String getAssetTag() {
        return assetTag;
    }

    public void setAssetTag(String assetTag) {
        this.assetTag = assetTag;
    }

    /*
     * ============================================================
     * CATEGORY
     * ============================================================
     */

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    /*
     * ============================================================
     * HOURLY RATE
     * ============================================================
     */

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    /*
     * ============================================================
     * DEPARTMENT
     * ============================================================
     */

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    /*
     * ============================================================
     * INSTITUTION
     * ============================================================
     */

    public Institution getInstitution() {
        return institution;
    }

    public void setInstitution(Institution institution) {
        this.institution = institution;
    }

    /*
     * ============================================================
     * MANUFACTURER
     * ============================================================
     */

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    /*
     * ============================================================
     * MODEL
     * ============================================================
     */

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    /*
     * ============================================================
     * IMAGE URL
     * ============================================================
     */

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    /*
     * ============================================================
     * STATUS
     * ============================================================
     */

    public EquipmentStatus getStatus() {
        return status;
    }

    public void setStatus(EquipmentStatus status) {
        this.status = status;
    }

    /*
     * ============================================================
     * CALIBRATION DUE DATE
     * ============================================================
     */

    public LocalDate getCalibrationDueDate() {
        return calibrationDueDate;
    }

    public void setCalibrationDueDate(LocalDate calibrationDueDate) {
        this.calibrationDueDate = calibrationDueDate;
    }

    /*
     * ============================================================
     * MANUAL DOCUMENT
     * ============================================================
     */

    public String getManualDocument() {
        return manualDocument;
    }

    public void setManualDocument(String manualDocument) {
        this.manualDocument = manualDocument;
    }

    /*
     * ============================================================
     * CALIBRATION CERTIFICATE
     * ============================================================
     */

    public String getCalibrationCertificate() {
        return calibrationCertificate;
    }

    public void setCalibrationCertificate(String calibrationCertificate) {
        this.calibrationCertificate = calibrationCertificate;
    }

    /*
     * ============================================================
     * LAST CALIBRATION DATE
     * ============================================================
     */

    public LocalDate getLastCalibrationDate() {
        return lastCalibrationDate;
    }

    public void setLastCalibrationDate(LocalDate lastCalibrationDate) {
        this.lastCalibrationDate = lastCalibrationDate;
    }

    /*
     * ============================================================
     * NEXT CALIBRATION DATE
     * ============================================================
     */

    public LocalDate getNextCalibrationDate() {
        return nextCalibrationDate;
    }

    public void setNextCalibrationDate(LocalDate nextCalibrationDate) {
        this.nextCalibrationDate = nextCalibrationDate;
    }

    /*
     * ============================================================
     * CERTIFICATION DETAILS
     * ============================================================
     */

    public String getCertificationDetails() {
        return certificationDetails;
    }

    public void setCertificationDetails(String certificationDetails) {
        this.certificationDetails = certificationDetails;
    }

    /*
     * ============================================================
     * CERTIFICATION EXPIRY DATE
     * ============================================================
     */

    public LocalDate getCertificationExpiryDate() {
        return certificationExpiryDate;
    }

    public void setCertificationExpiryDate(
            LocalDate certificationExpiryDate) {

        this.certificationExpiryDate = certificationExpiryDate;
    }

    /*
     * ============================================================
     * SUPPLIER
     * ============================================================
     */

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    /*
     * ============================================================
     * PURCHASE DATE
     * ============================================================
     */

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    /*
     * ============================================================
     * PURCHASE COST
     * ============================================================
     */

    public BigDecimal getPurchaseCost() {
        return purchaseCost;
    }

    public void setPurchaseCost(BigDecimal purchaseCost) {
        this.purchaseCost = purchaseCost;
    }

    /*
     * ============================================================
     * CREATED AT
     * ============================================================
     */

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}