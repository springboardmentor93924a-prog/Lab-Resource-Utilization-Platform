package com.example.lab_platform.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "chargeback_requests")
public class ChargebackRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chargeback_id")
    private Integer chargebackId;

    // DEPARTMENT: recovering cost from a department within the same
    // institution (sourced from a DepartmentCostAllocation).
    // INSTITUTION: recovering cost from a partner institution for
    // shared-equipment usage (sourced from a ResourceSharingRequest).
    @Column(name = "scope_type", nullable = false, length = 20)
    private String scopeType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usage_cost_id")
    private EquipmentUsageCost usageCost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sharing_request_id")
    private ResourceSharingRequest sharingRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payer_department_id")
    private Department payerDepartment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payer_institution_id")
    private Institution payerInstitution;

    @Column(name = "amount", nullable = false)
    private Double amount;

    // REQUESTED -> APPROVED -> SETTLED, or REQUESTED -> DISPUTED
    @Column(name = "status", nullable = false, length = 20)
    private String status = "REQUESTED";

    @Column(name = "requested_date", nullable = false)
    private LocalDate requestedDate;

    @Column(name = "settled_date")
    private LocalDate settledDate;

    @Column(name = "remarks")
    private String remarks;

    @PrePersist
    protected void onCreate() {
        if (requestedDate == null) {
            requestedDate = LocalDate.now();
        }
    }

    public Integer getChargebackId() {
        return chargebackId;
    }

    public void setChargebackId(Integer chargebackId) {
        this.chargebackId = chargebackId;
    }

    public String getScopeType() {
        return scopeType;
    }

    public void setScopeType(String scopeType) {
        this.scopeType = scopeType;
    }

    public EquipmentUsageCost getUsageCost() {
        return usageCost;
    }

    public void setUsageCost(EquipmentUsageCost usageCost) {
        this.usageCost = usageCost;
    }

    public ResourceSharingRequest getSharingRequest() {
        return sharingRequest;
    }

    public void setSharingRequest(ResourceSharingRequest sharingRequest) {
        this.sharingRequest = sharingRequest;
    }

    public Department getPayerDepartment() {
        return payerDepartment;
    }

    public void setPayerDepartment(Department payerDepartment) {
        this.payerDepartment = payerDepartment;
    }

    public Institution getPayerInstitution() {
        return payerInstitution;
    }

    public void setPayerInstitution(Institution payerInstitution) {
        this.payerInstitution = payerInstitution;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getRequestedDate() {
        return requestedDate;
    }

    public void setRequestedDate(LocalDate requestedDate) {
        this.requestedDate = requestedDate;
    }

    public LocalDate getSettledDate() {
        return settledDate;
    }

    public void setSettledDate(LocalDate settledDate) {
        this.settledDate = settledDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}