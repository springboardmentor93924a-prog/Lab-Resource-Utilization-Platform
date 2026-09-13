
package com.labresource.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "inter_institution_billing")
public class InterInstitutionBilling {

    // =========================================================
    // ID
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // SHARING INSTITUTION
    // Institution that owns/provides the equipment
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sharing_institution_id", nullable = false)
    private Institution sharingInstitution;


    // =========================================================
    // USING INSTITUTION
    // Institution using the shared equipment
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "using_institution_id", nullable = false)
    private Institution usingInstitution;


    // =========================================================
    // EQUIPMENT
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;


    // =========================================================
    // USAGE HOURS
    // =========================================================

    @Column(name = "usage_hours", nullable = false)
    private Double usageHours = 0.0;


    // =========================================================
    // AMOUNT
    // =========================================================

    @Column(nullable = false)
    private Double amount = 0.0;


    // =========================================================
    // BILLING STATUS
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_status", nullable = false)
    private BillingStatus billingStatus = BillingStatus.PENDING;


    // =========================================================
    // BILLING DATE
    // =========================================================

    @Column(name = "billing_date", nullable = false)
    private LocalDate billingDate;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public InterInstitutionBilling() {
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

    public Institution getSharingInstitution() {
        return sharingInstitution;
    }

    public void setSharingInstitution(
            Institution sharingInstitution
    ) {
        this.sharingInstitution = sharingInstitution;
    }

    public Institution getUsingInstitution() {
        return usingInstitution;
    }

    public void setUsingInstitution(
            Institution usingInstitution
    ) {
        this.usingInstitution = usingInstitution;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(
            Equipment equipment
    ) {
        this.equipment = equipment;
    }

    public Double getUsageHours() {
        return usageHours;
    }

    public void setUsageHours(
            Double usageHours
    ) {
        this.usageHours = usageHours;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(
            Double amount
    ) {
        this.amount = amount;
    }

    public BillingStatus getBillingStatus() {
        return billingStatus;
    }

    public void setBillingStatus(
            BillingStatus billingStatus
    ) {
        this.billingStatus = billingStatus;
    }

    public LocalDate getBillingDate() {
        return billingDate;
    }

    public void setBillingDate(
            LocalDate billingDate
    ) {
        this.billingDate = billingDate;
    }
}
