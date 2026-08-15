package com.labresource.backend.budget.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Budget")
@Getter
@Setter
@NoArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "budget_id")
    private Long budgetId;

    @Column(name = "institution_id", nullable = false)
    private Long institutionId;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "fiscal_year", nullable = false, length = 20)
    private String fiscalYear;

    @Column(name = "allocated_amount", nullable = false)
    private BigDecimal allocatedAmount = BigDecimal.ZERO;

    @Column(name = "used_amount", nullable = false)
    private BigDecimal usedAmount = BigDecimal.ZERO;

    @Column(name = "remaining_amount", nullable = false)
    private BigDecimal remainingAmount = BigDecimal.ZERO;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
