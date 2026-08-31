package com.labresource.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "cost_recovery")
public class CostRecovery {

    // =========================================================
    // ID
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // ORIGINAL COST
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cost_id", nullable = false)
    private Cost cost;


    // =========================================================
    // DEPARTMENT
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;


    // =========================================================
    // INSTITUTION
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;


    // =========================================================
    // EQUIPMENT
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;


    // =========================================================
    // RECOVERABLE AMOUNT
    // =========================================================

    @Column(name = "recoverable_amount", nullable = false)
    private Double recoverableAmount = 0.0;


    // =========================================================
    // RECOVERED AMOUNT
    // =========================================================

    @Column(name = "recovered_amount", nullable = false)
    private Double recoveredAmount = 0.0;


    // =========================================================
    // OUTSTANDING AMOUNT
    // =========================================================

    @Column(name = "outstanding_amount", nullable = false)
    private Double outstandingAmount = 0.0;


    // =========================================================
    // CHARGEBACK STATUS
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "chargeback_status", nullable = false)
    private ChargebackStatus chargebackStatus =
            ChargebackStatus.PENDING;


    // =========================================================
    // RECOVERY DATE
    // =========================================================

    @Column(name = "recovery_date")
    private LocalDate recoveryDate;


    // =========================================================
    // DESCRIPTION
    // =========================================================

    @Column(columnDefinition = "TEXT")
    private String description;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public CostRecovery() {
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

    public Cost getCost() {
        return cost;
    }

    public void setCost(Cost cost) {
        this.cost = cost;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(
            Department department
    ) {
        this.department = department;
    }

    public Institution getInstitution() {
        return institution;
    }

    public void setInstitution(
            Institution institution
    ) {
        this.institution = institution;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(
            Equipment equipment
    ) {
        this.equipment = equipment;
    }

    public Double getRecoverableAmount() {
        return recoverableAmount;
    }

    public void setRecoverableAmount(
            Double recoverableAmount
    ) {
        this.recoverableAmount = recoverableAmount;
    }

    public Double getRecoveredAmount() {
        return recoveredAmount;
    }

    public void setRecoveredAmount(
            Double recoveredAmount
    ) {
        this.recoveredAmount = recoveredAmount;
    }

    public Double getOutstandingAmount() {
        return outstandingAmount;
    }

    public void setOutstandingAmount(
            Double outstandingAmount
    ) {
        this.outstandingAmount = outstandingAmount;
    }

    public ChargebackStatus getChargebackStatus() {
        return chargebackStatus;
    }

    public void setChargebackStatus(
            ChargebackStatus chargebackStatus
    ) {
        this.chargebackStatus = chargebackStatus;
    }

    public LocalDate getRecoveryDate() {
        return recoveryDate;
    }

    public void setRecoveryDate(
            LocalDate recoveryDate
    ) {
        this.recoveryDate = recoveryDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description
    ) {
        this.description = description;
    }
}