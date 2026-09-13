
package com.labresource.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "calibrations")
public class Calibration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Equipment being calibrated
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    // Last calibration information
    @Column(name = "last_calibration_date")
    private LocalDate lastCalibrationDate;

    @Column(name = "next_calibration_date")
    private LocalDate nextCalibrationDate;

    // Certification information
    @Column(name = "certificate_number")
    private String certificateNumber;

    @Column(name = "certification_details", columnDefinition = "TEXT")
    private String certificationDetails;

    @Column(name = "certification_expiry_date")
    private LocalDate certificationExpiryDate;

    // Person/company that performed the calibration
    @Column(name = "performed_by")
    private String performedBy;

    // Additional information
    @Column(columnDefinition = "TEXT")
    private String remarks;

    // Record creation timestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // =========================================================
    // CONSTRUCTORS
    // =========================================================

    public Calibration() {
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

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public LocalDate getLastCalibrationDate() {
        return lastCalibrationDate;
    }

    public void setLastCalibrationDate(
            LocalDate lastCalibrationDate) {

        this.lastCalibrationDate = lastCalibrationDate;
    }

    public LocalDate getNextCalibrationDate() {
        return nextCalibrationDate;
    }

    public void setNextCalibrationDate(
            LocalDate nextCalibrationDate) {

        this.nextCalibrationDate = nextCalibrationDate;
    }

    public String getCertificateNumber() {
        return certificateNumber;
    }

    public void setCertificateNumber(
            String certificateNumber) {

        this.certificateNumber = certificateNumber;
    }

    public String getCertificationDetails() {
        return certificationDetails;
    }

    public void setCertificationDetails(
            String certificationDetails) {

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

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt = createdAt;
    }

    // =========================================================
    // PRE-PERSIST
    // =========================================================

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
