package com.labresource.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "calibration_records")
public class CalibrationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "calibration_id")
    private Long calibrationId;

    @Column(name = "equipment_id", nullable = false, insertable = false, updatable = false)
    private Long equipmentId;

    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(name = "calibration_date", nullable = false)
    private String calibrationDate;

    @Column(name = "calibrated_by", length = 100)
    private String calibratedBy;

    @Column(name = "certificate_number", length = 100)
    private String certificateNumber;

    @Column(name = "next_due_date")
    private String nextDueDate;

    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "remarks", length = 255)
    private String remarks;

    // Default Constructor
    public CalibrationRecord() {
    }

    // Parameterized Constructor
    public CalibrationRecord(Long calibrationId,
                             Long equipmentId,
                             String calibrationDate,
                             String calibratedBy,
                             String certificateNumber,
                             String nextDueDate,
                             String status,
                             String remarks) {

        this.calibrationId = calibrationId;
        this.equipmentId = equipmentId;
        this.calibrationDate = calibrationDate;
        this.calibratedBy = calibratedBy;
        this.certificateNumber = certificateNumber;
        this.nextDueDate = nextDueDate;
        this.status = status;
        this.remarks = remarks;
    }

    public Long getCalibrationId() {
        return calibrationId;
    }

    public void setCalibrationId(Long calibrationId) {
        this.calibrationId = calibrationId;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getCalibrationDate() {
        return calibrationDate;
    }

    public void setCalibrationDate(String calibrationDate) {
        this.calibrationDate = calibrationDate;
    }

    public String getCalibratedBy() {
        return calibratedBy;
    }

    public void setCalibratedBy(String calibratedBy) {
        this.calibratedBy = calibratedBy;
    }

    public String getCertificateNumber() {
        return certificateNumber;
    }

    public void setCertificateNumber(String certificateNumber) {
        this.certificateNumber = certificateNumber;
    }

    public String getNextDueDate() {
        return nextDueDate;
    }

    public void setNextDueDate(String nextDueDate) {
        this.nextDueDate = nextDueDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }
}