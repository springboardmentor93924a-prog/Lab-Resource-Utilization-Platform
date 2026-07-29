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
@Table(name = "sensor_readings")
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reading_id")
    private Long readingId;

    @Column(name = "equipment_id", nullable = false, insertable = false, updatable = false)
    private Long equipmentId;

    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(name = "sensor_type", nullable = false, length = 50)
    private String sensorType;

    @Column(name = "reading_value", nullable = false)
    private Double readingValue;

    @Column(name = "unit", length = 20)
    private String unit;

    @Column(name = "recorded_at", nullable = false)
    private String recordedAt;

    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "remarks", length = 255)
    private String remarks;

    // Default Constructor
    public SensorReading() {
    }

    // Parameterized Constructor
    public SensorReading(Long readingId,
                         Long equipmentId,
                         String sensorType,
                         Double readingValue,
                         String unit,
                         String recordedAt,
                         String status,
                         String remarks) {

        this.readingId = readingId;
        this.equipmentId = equipmentId;
        this.sensorType = sensorType;
        this.readingValue = readingValue;
        this.unit = unit;
        this.recordedAt = recordedAt;
        this.status = status;
        this.remarks = remarks;
    }

    public Long getReadingId() {
        return readingId;
    }

    public void setReadingId(Long readingId) {
        this.readingId = readingId;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getSensorType() {
        return sensorType;
    }

    public void setSensorType(String sensorType) {
        this.sensorType = sensorType;
    }

    public Double getReadingValue() {
        return readingValue;
    }

    public void setReadingValue(Double readingValue) {
        this.readingValue = readingValue;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(String recordedAt) {
        this.recordedAt = recordedAt;
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