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

    // FIX: was "nullable = false". The actual DB column
    // (public.equipment.institution_id) has NO NOT NULL constraint,
    // and several existing rows genuinely have institution_id = NULL
    // (legacy equipment created before multi-institution support).
    // Hibernate uses @JoinColumn(nullable=...) — not @ManyToOne's
    // "optional" flag — to decide INNER JOIN vs LEFT OUTER JOIN for
    // this EAGER association's own SELECT. With nullable=false,
    // Hibernate generated an INNER JOIN against institutions; any
    // Equipment row whose institution_id is NULL then had ZERO rows
    // returned by its own by-ID load, and Hibernate raised
    // "EntityNotFoundException: No row with the given identifier
    // exists for entity Equipment with id 'N'" the moment such a row
    // needed to be initialized (e.g. while building
    // MaintenanceRequestDTO for every request in GET /api/maintenance-requests).
    // Setting nullable = true restores a LEFT OUTER JOIN, matching
    // real data: institution loads normally when present, and is
    // simply null when the column is null — no more false
    // "entity not found" errors for equipment with no institution set.
    @ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(
        name = "institution_id",
        nullable = true
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
}