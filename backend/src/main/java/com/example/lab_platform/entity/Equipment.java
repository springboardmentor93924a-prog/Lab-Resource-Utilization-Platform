 package com.example.lab_platform.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "equipment")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "equipment_id")
    private Integer equipmentId;

    @Column(name = "equipment_name", nullable = false, length = 100)
    private String equipmentName;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "serial_number", unique = true, length = 100)
    private String serialNumber;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "status", length = 20)
    private String status = "Available";

    @Column(name = "requires_approval")
private Boolean requiresApproval = true;

    // Task 3 - Cost Management: hourly billing rate used to compute
    // usage cost for every completed booking of this equipment.
    // Defaults to 0 so existing rows (created before this column
    // existed) don't silently generate incorrect non-zero costs.
    @Column(name = "rate_per_hour")
    private Double ratePerHour = 0.0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
        name = "department_id",
        nullable = false
    )
    private Department department;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    // 🔥 NEW FIELD (Idle Detection ke liye)
    @Column(name = "last_used_date")
    private LocalDate lastUsedDate;

    @ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(
        name = "institution_id",
        nullable = false
)
private Institution institution;

    public Equipment() {
    }

    public Integer getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Integer equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    // 🔥 GETTER SETTER (NEW)

    public LocalDate getLastUsedDate() {
        return lastUsedDate;
    }

    public void setLastUsedDate(LocalDate lastUsedDate) {
        this.lastUsedDate = lastUsedDate;
    }

    public Institution getInstitution() {
    return institution;
}

public void setInstitution(Institution institution) {
    this.institution = institution;
}

public Boolean getRequiresApproval() {
    return requiresApproval;
}

public void setRequiresApproval(Boolean requiresApproval) {
    this.requiresApproval = requiresApproval;
}

public Double getRatePerHour() {
    return ratePerHour;
}

public void setRatePerHour(Double ratePerHour) {
    this.ratePerHour = ratePerHour;
}
}