
package com.labresource.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "shared_equipment")
public class SharedEquipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Equipment being shared
    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    // Institution that owns the equipment
    @ManyToOne
    @JoinColumn(name = "owner_institution_id", nullable = false)
    private Institution ownerInstitution;

    // Institution receiving access
    @ManyToOne
    @JoinColumn(name = "shared_with_institution_id", nullable = false)
    private Institution sharedWithInstitution;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(nullable = false)
    private String sharingStatus = "ACTIVE";

    private String sharingNotes;

    public SharedEquipment() {
    }

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

    public Institution getOwnerInstitution() {
        return ownerInstitution;
    }

    public void setOwnerInstitution(Institution ownerInstitution) {
        this.ownerInstitution = ownerInstitution;
    }

    public Institution getSharedWithInstitution() {
        return sharedWithInstitution;
    }

    public void setSharedWithInstitution(
            Institution sharedWithInstitution
    ) {
        this.sharedWithInstitution = sharedWithInstitution;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public String getSharingStatus() {
        return sharingStatus;
    }

    public void setSharingStatus(String sharingStatus) {
        this.sharingStatus = sharingStatus;
    }

    public String getSharingNotes() {
        return sharingNotes;
    }

    public void setSharingNotes(String sharingNotes) {
        this.sharingNotes = sharingNotes;
    }
}
