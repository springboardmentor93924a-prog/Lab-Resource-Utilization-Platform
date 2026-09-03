package com.example.lab_platform.dto;

import java.time.LocalDate;

public class BudgetRequestDTO {

    // Null departmentId = institution-wide budget.
    private Integer departmentId;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private Double budgetAmount;
    private String notes;

    public Integer getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Integer departmentId) {
        this.departmentId = departmentId;
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

    public Double getBudgetAmount() {
        return budgetAmount;
    }

    public void setBudgetAmount(Double budgetAmount) {
        this.budgetAmount = budgetAmount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}