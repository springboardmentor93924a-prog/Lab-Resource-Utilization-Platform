package com.labresource.backend.billing.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "CostRecord")
@Getter
@Setter
@NoArgsConstructor
public class CostRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cost_id")
    private Long costId;

    @Column(name = "equipment_id", nullable = false)
    private Long equipmentId;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "cost_type", nullable = false, length = 30)
    private String costType; // USAGE, MAINTENANCE, SHARING_FEE

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency = "INR";

    @Column(name = "billing_period", length = 20)
    private String billingPeriod;

    @Column(name = "sharing_agreement_id")
    private Long sharingAgreementId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
