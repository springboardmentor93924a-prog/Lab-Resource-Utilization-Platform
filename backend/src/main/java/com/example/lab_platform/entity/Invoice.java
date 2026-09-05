package com.example.lab_platform.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Integer invoiceId;

    @Column(name = "invoice_number", nullable = false, unique = true, length = 40)
    private String invoiceNumber;

    // Exactly one of these is set - who the invoice is billed to.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billed_to_department_id")
    private Department billedToDepartment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billed_to_institution_id")
    private Institution billedToInstitution;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount = 0.0;

    // DRAFT -> ISSUED -> PAID
    @Column(name = "status", nullable = false, length = 20)
    private String status = "DRAFT";

    @Column(name = "issued_date")
    private LocalDate issuedDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceLineItem> lineItems = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
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

    public Department getBilledToDepartment() {
        return billedToDepartment;
    }

    public void setBilledToDepartment(Department billedToDepartment) {
        this.billedToDepartment = billedToDepartment;
    }

    public Institution getBilledToInstitution() {
        return billedToInstitution;
    }

    public void setBilledToInstitution(Institution billedToInstitution) {
        this.billedToInstitution = billedToInstitution;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<InvoiceLineItem> getLineItems() {
        return lineItems;
    }

    public void setLineItems(List<InvoiceLineItem> lineItems) {
        this.lineItems = lineItems;
    }
}