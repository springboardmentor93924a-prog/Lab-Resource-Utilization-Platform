package com.labplatform.billing.model;

import com.labplatform.booking.model.Booking;
import com.labplatform.institution.model.Institution;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "billing_records")
public class BillingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billed_institution_id", nullable = false)
    private Institution billedInstitution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owning_institution_id", nullable = false)
    private Institution owningInstitution;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillingStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public BillingRecord() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = BillingStatus.UNPAID;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public Institution getBilledInstitution() { return billedInstitution; }
    public void setBilledInstitution(Institution billedInstitution) { this.billedInstitution = billedInstitution; }

    public Institution getOwningInstitution() { return owningInstitution; }
    public void setOwningInstitution(Institution owningInstitution) { this.owningInstitution = owningInstitution; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BillingStatus getStatus() { return status; }
    public void setStatus(BillingStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}