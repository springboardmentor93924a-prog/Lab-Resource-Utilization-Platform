package com.labplatform.billing.dto;

import com.labplatform.billing.model.BillingRecord;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BillingRecordResponse {

    private Integer id;
    private Long bookingId;

    private String equipmentName;
    private String department;

    private String billedInstitutionName;
    private String owningInstitutionName;

    private BigDecimal amount;
    private BigDecimal hourlyRate;

    private Integer durationHours;

    private String status;
    private LocalDateTime createdAt;

    public BillingRecordResponse() {
    }

    public BillingRecordResponse(BillingRecord r) {

        this.id = r.getId();

        this.bookingId = r.getBooking().getId();

        this.equipmentName =
                r.getBooking().getEquipment().getEquipmentName();

        /*
         * Department associated with the equipment.
         * Equipment already contains a department field
         * in the current project.
         */
        this.department =
                r.getBooking().getEquipment().getDepartment();

        this.billedInstitutionName =
                r.getBilledInstitution().getName();

        this.owningInstitutionName =
                r.getOwningInstitution().getName();

        this.amount = r.getAmount();

        this.hourlyRate =
                r.getBooking().getEquipment().getHourlyRate();

        this.durationHours =
                r.getBooking().getDurationHours();

        this.status =
                r.getStatus().name();

        this.createdAt =
                r.getCreatedAt();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getBilledInstitutionName() {
        return billedInstitutionName;
    }

    public void setBilledInstitutionName(String billedInstitutionName) {
        this.billedInstitutionName = billedInstitutionName;
    }

    public String getOwningInstitutionName() {
        return owningInstitutionName;
    }

    public void setOwningInstitutionName(String owningInstitutionName) {
        this.owningInstitutionName = owningInstitutionName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public Integer getDurationHours() {
        return durationHours;
    }

    public void setDurationHours(Integer durationHours) {
        this.durationHours = durationHours;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}