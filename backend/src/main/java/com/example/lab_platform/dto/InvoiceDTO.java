package com.example.lab_platform.dto;

import java.time.LocalDate;
import java.util.List;

public class InvoiceDTO {

    private Integer invoiceId;
    private String invoiceNumber;
    private String billedToLabel;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private Double totalAmount;
    private String status;
    private LocalDate issuedDate;
    private List<InvoiceLineItemDTO> lineItems;

    public static class InvoiceLineItemDTO {
        private String description;
        private Double amount;

        public InvoiceLineItemDTO() {
        }

        public InvoiceLineItemDTO(String description, Double amount) {
            this.description = description;
            this.amount = amount;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Double getAmount() {
            return amount;
        }

        public void setAmount(Double amount) {
            this.amount = amount;
        }
    }

    public Integer getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(Integer invoiceId) {
        this.invoiceId = invoiceId;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public String getBilledToLabel() {
        return billedToLabel;
    }

    public void setBilledToLabel(String billedToLabel) {
        this.billedToLabel = billedToLabel;
    }

    public LocalDate getPeriodStart() {
        return periodStart;
    }

    public void setPeriodStart(LocalDate periodStart) {
        this.periodStart = periodStart;
    }

    public LocalDate getPeriodEnd() {
        return periodEnd;
    }

    public void setPeriodEnd(LocalDate periodEnd) {
        this.periodEnd = periodEnd;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getIssuedDate() {
        return issuedDate;
    }

    public void setIssuedDate(LocalDate issuedDate) {
        this.issuedDate = issuedDate;
    }

    public List<InvoiceLineItemDTO> getLineItems() {
        return lineItems;
    }

    public void setLineItems(List<InvoiceLineItemDTO> lineItems) {
        this.lineItems = lineItems;
    }
}