package com.example.lab_platform.dto;

import java.time.LocalDate;

public class ChargebackDTO {

    private Integer chargebackId;
    private String scopeType;
    private String payerLabel; // department or institution name being charged
    private String sourceLabel; // equipment / sharing agreement description
    private Double amount;
    private String status;
    private LocalDate requestedDate;
    private LocalDate settledDate;
    private String remarks;

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

    public String getPayerLabel() {
        return payerLabel;
    }

    public void setPayerLabel(String payerLabel) {
        this.payerLabel = payerLabel;
    }

    public String getSourceLabel() {
        return sourceLabel;
    }

    public void setSourceLabel(String sourceLabel) {
        this.sourceLabel = sourceLabel;
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