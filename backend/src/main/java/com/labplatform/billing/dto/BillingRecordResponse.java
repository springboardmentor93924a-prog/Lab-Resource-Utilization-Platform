package com.labplatform.billing.dto;

import com.labplatform.billing.model.BillingRecord;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BillingRecordResponse {

    private Integer id;
    private Long bookingId;
    private String equipmentName;
    private String billedInstitutionName;
    private String owningInstitutionName;
    private BigDecimal amount;
    private String status;
    private LocalDateTime createdAt;

    public BillingRecordResponse() {
    }

    public BillingRecordResponse(BillingRecord r) {
        this.id = r.getId();
        this.bookingId = r.getBooking().getId();
        this.equipmentName = r.getBooking().getEquipment().getEquipmentName();
        this.billedInstitutionName = r.getBilledInstitution().getName();
        this.owningInstitutionName = r.getOwningInstitution().getName();
        this.amount = r.getAmount();
        this.status = r.getStatus().name();
        this.createdAt = r.getCreatedAt();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public String getEquipmentName() { return equipmentName; }
    public void setEquipmentName(String equipmentName) { this.equipmentName = equipmentName; }

    public String getBilledInstitutionName() { return billedInstitutionName; }
    public void setBilledInstitutionName(String billedInstitutionName) { this.billedInstitutionName = billedInstitutionName; }

    public String getOwningInstitutionName() { return owningInstitutionName; }
    public void setOwningInstitutionName(String owningInstitutionName) { this.owningInstitutionName = owningInstitutionName; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}