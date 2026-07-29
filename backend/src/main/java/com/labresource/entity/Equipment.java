package com.labresource.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "equipment")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "equipment_id")
    private Long equipmentId;

    @Column(name = "category_id", nullable = false, insertable = false, updatable = false)
    private Long categoryId;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private EquipmentCategory category;

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(name = "equipment_name", nullable = false, length = 100)
    private String equipmentName;

    @Column(name = "equipment_code", nullable = false, unique = true, length = 50)
    private String equipmentCode;

    @Column(name = "manufacturer", length = 100)
    private String manufacturer;

    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "serial_number", unique = true, length = 100)
    private String serialNumber;

    @Column(name = "purchase_date")
    private String purchaseDate;

    @Column(name = "warranty_expiry")
    private String warrantyExpiry;

    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "remarks", length = 255)
    private String remarks;

    @OneToMany(mappedBy = "equipment")
    private List<Booking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "equipment")
    private List<MaintenanceRecord> maintenanceRecords = new ArrayList<>();

    @OneToMany(mappedBy = "equipment")
    private List<CalibrationRecord> calibrationRecords = new ArrayList<>();

    @OneToMany(mappedBy = "equipment")
    private List<SensorReading> sensorReadings = new ArrayList<>();

    // Default Constructor
    public Equipment() {
    }

    // Parameterized Constructor
    public Equipment(Long equipmentId, Long categoryId, Long institutionId,
                     Long departmentId, String equipmentName,
                     String equipmentCode, String manufacturer,
                     String model, String serialNumber,
                     String purchaseDate, String warrantyExpiry,
                     String status, String location,
                     String remarks) {

        this.equipmentId = equipmentId;
        this.categoryId = categoryId;
        this.institutionId = institutionId;
        this.departmentId = departmentId;
        this.equipmentName = equipmentName;
        this.equipmentCode = equipmentCode;
        this.manufacturer = manufacturer;
        this.model = model;
        this.serialNumber = serialNumber;
        this.purchaseDate = purchaseDate;
        this.warrantyExpiry = warrantyExpiry;
        this.status = status;
        this.location = location;
        this.remarks = remarks;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(Long institutionId) {
        this.institutionId = institutionId;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getEquipmentCode() {
        return equipmentCode;
    }

    public void setEquipmentCode(String equipmentCode) {
        this.equipmentCode = equipmentCode;
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

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(String purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public String getWarrantyExpiry() {
        return warrantyExpiry;
    }

    public void setWarrantyExpiry(String warrantyExpiry) {
        this.warrantyExpiry = warrantyExpiry;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public EquipmentCategory getCategory() {
        return category;
    }

    public void setCategory(EquipmentCategory category) {
        this.category = category;
    }

    public List<Booking> getBookings() {
        return bookings;
    }

    public void setBookings(List<Booking> bookings) {
        this.bookings = bookings;
    }

    public List<MaintenanceRecord> getMaintenanceRecords() {
        return maintenanceRecords;
    }

    public void setMaintenanceRecords(List<MaintenanceRecord> maintenanceRecords) {
        this.maintenanceRecords = maintenanceRecords;
    }

    public List<CalibrationRecord> getCalibrationRecords() {
        return calibrationRecords;
    }

    public void setCalibrationRecords(List<CalibrationRecord> calibrationRecords) {
        this.calibrationRecords = calibrationRecords;
    }

    public List<SensorReading> getSensorReadings() {
        return sensorReadings;
    }

    public void setSensorReadings(List<SensorReading> sensorReadings) {
        this.sensorReadings = sensorReadings;
    }
}