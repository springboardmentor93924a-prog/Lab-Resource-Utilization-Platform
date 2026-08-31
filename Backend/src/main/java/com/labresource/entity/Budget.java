package com.labresource.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // DEPARTMENT
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    // =========================================================
    // INSTITUTION
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id")
    private Institution institution;

    // =========================================================
    // BUDGET AMOUNT
    // =========================================================

    @Column(nullable = false)
    private Double budgetAmount = 0.0;

    // =========================================================
    // USED AMOUNT
    // =========================================================

    @Column(nullable = false)
    private Double usedAmount = 0.0;

    // =========================================================
    // FINANCIAL YEAR
    // =========================================================

    @Column(nullable = false)
    private String financialYear;

    // =========================================================
    // BUDGET STATUS
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BudgetStatus budgetStatus = BudgetStatus.ACTIVE;

    // =========================================================
    // CREATED / UPDATED
    // =========================================================

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Budget() {
    }

    // =========================================================
    // PRE PERSIST
    // =========================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (budgetAmount == null) {
            budgetAmount = 0.0;
        }

        if (usedAmount == null) {
            usedAmount = 0.0;
        }

        if (budgetStatus == null) {
            budgetStatus = BudgetStatus.ACTIVE;
        }
    }

    // =========================================================
    // PRE UPDATE
    // =========================================================

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // =========================================================
    // CALCULATED REMAINING AMOUNT
    // =========================================================

    @Transient
    public Double getRemainingAmount() {

        double budget = budgetAmount == null
                ? 0.0
                : budgetAmount;

        double used = usedAmount == null
                ? 0.0
                : usedAmount;

        return Math.max(
                budget - used,
                0.0
        );
    }

    // =========================================================
    // CALCULATED UTILIZATION
    // =========================================================

    @Transient
    public Double getUtilizationPercentage() {

        if (budgetAmount == null ||
            budgetAmount <= 0) {

            return 0.0;
        }

        double used = usedAmount == null
                ? 0.0
                : usedAmount;

        return Math.min(
                (used / budgetAmount) * 100.0,
                100.0
        );
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(
            Department department
    ) {
        this.department = department;
    }

    public Institution getInstitution() {
        return institution;
    }

    public void setInstitution(
            Institution institution
    ) {
        this.institution = institution;
    }

    public Double getBudgetAmount() {
        return budgetAmount;
    }

    public void setBudgetAmount(
            Double budgetAmount
    ) {
        this.budgetAmount = budgetAmount;
    }

    public Double getUsedAmount() {
        return usedAmount;
    }

    public void setUsedAmount(
            Double usedAmount
    ) {
        this.usedAmount = usedAmount;
    }

    public String getFinancialYear() {
        return financialYear;
    }

    public void setFinancialYear(
            String financialYear
    ) {
        this.financialYear = financialYear;
    }

    public BudgetStatus getBudgetStatus() {
        return budgetStatus;
    }

    public void setBudgetStatus(
            BudgetStatus budgetStatus
    ) {
        this.budgetStatus = budgetStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}