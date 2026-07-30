package com.labresource.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "billing_records",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_billing_invoice_number",
                        columnNames = "invoice_number"
                )
        }
)
public class BillingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    /*
     * External booking for which the invoice is generated.
     *
     * Example:
     * Institution A booked equipment belonging to Institution B.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "external_booking_id",
            nullable = false
    )
    private ExternalBooking externalBooking;

    /*
     * Institution that needs to pay the bill.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "payer_institution_id",
            nullable = false
    )
    private Institution payerInstitution;

    /*
     * Institution that receives the payment.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "receiver_institution_id",
            nullable = false
    )
    private Institution receiverInstitution;

    /*
     * User who generated the invoice.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "created_by_user_id",
            nullable = false
    )
    private User createdBy;

    @Column(
            name = "base_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal baseAmount;

    @Column(
            name = "tax_percentage",
            nullable = false,
            precision = 5,
            scale = 2
    )
    private BigDecimal taxPercentage;

    @Column(
            name = "tax_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal taxAmount;

    @Column(
            name = "total_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal totalAmount;

    @Column(
            nullable = false,
            length = 10
    )
    private String currency;

    @Column(
            name = "invoice_number",
            nullable = false,
            unique = true,
            length = 100
    )
    private String invoiceNumber;

    @Column(
            name = "invoice_date",
            nullable = false
    )
    private LocalDate invoiceDate;

    @Column(
            name = "due_date",
            nullable = false
    )
    private LocalDate dueDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    /*
     * DRAFT
     * GENERATED
     * SENT
     * CANCELLED
     */
    @Column(
            name = "billing_status",
            nullable = false,
            length = 30
    )
    private String billingStatus;

    /*
     * PENDING
     * PARTIALLY_PAID
     * PAID
     * OVERDUE
     * REFUNDED
     */
    @Column(
            name = "payment_status",
            nullable = false,
            length = 30
    )
    private String paymentStatus;

    @Column(length = 500)
    private String description;

    @Column(
            name = "payment_reference",
            length = 255
    )
    private String paymentReference;

    @Column(length = 500)
    private String notes;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (currency == null || currency.isBlank()) {
            currency = "INR";
        }

        if (invoiceDate == null) {
            invoiceDate = LocalDate.now();
        }

        if (billingStatus == null || billingStatus.isBlank()) {
            billingStatus = "DRAFT";
        }

        if (paymentStatus == null || paymentStatus.isBlank()) {
            paymentStatus = "PENDING";
        }

        calculateAmounts();
    }

    @PreUpdate
    public void onUpdate() {

        updatedAt = LocalDateTime.now();

        calculateAmounts();
    }

    private void calculateAmounts() {

        if (baseAmount == null) {
            baseAmount = BigDecimal.ZERO;
        }

        if (taxPercentage == null) {
            taxPercentage = BigDecimal.ZERO;
        }

        taxAmount = baseAmount
                .multiply(taxPercentage)
                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP
                );

        totalAmount = baseAmount
                .add(taxAmount)
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ExternalBooking getExternalBooking() {
        return externalBooking;
    }

    public void setExternalBooking(
            ExternalBooking externalBooking
    ) {
        this.externalBooking = externalBooking;
    }

    public Institution getPayerInstitution() {
        return payerInstitution;
    }

    public void setPayerInstitution(
            Institution payerInstitution
    ) {
        this.payerInstitution = payerInstitution;
    }

    public Institution getReceiverInstitution() {
        return receiverInstitution;
    }

    public void setReceiverInstitution(
            Institution receiverInstitution
    ) {
        this.receiverInstitution = receiverInstitution;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public BigDecimal getBaseAmount() {
        return baseAmount;
    }

    public void setBaseAmount(BigDecimal baseAmount) {
        this.baseAmount = baseAmount;
    }

    public BigDecimal getTaxPercentage() {
        return taxPercentage;
    }

    public void setTaxPercentage(BigDecimal taxPercentage) {
        this.taxPercentage = taxPercentage;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public LocalDate getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDate invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDate getPaidDate() {
        return paidDate;
    }

    public void setPaidDate(LocalDate paidDate) {
        this.paidDate = paidDate;
    }

    public String getBillingStatus() {
        return billingStatus;
    }

    public void setBillingStatus(String billingStatus) {
        this.billingStatus = billingStatus;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(
            String paymentReference
    ) {
        this.paymentReference = paymentReference;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}