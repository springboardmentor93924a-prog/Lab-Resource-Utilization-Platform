package com.example.lab_platform.dto;

import java.time.LocalDate;

public class BudgetUtilizationDTO {

    private Integer budgetId;
    private String scopeLabel; // department name, or "<Institution> (institution-wide)"
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private Double budgetAmount;
    private Double spentAmount;
    private Double remainingAmount;
    private Double percentUsed;
    private boolean overBudget;
    private String notes;

    public Integer getBudgetId() {
        return budgetId;
    }

    public void setBudgetId(Integer budgetId) {
        this.budgetId = budgetId;
    }

    public String getScopeLabel() {
        return scopeLabel;
    }

    public void setScopeLabel(String scopeLabel) {
        this.scopeLabel = scopeLabel;
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

    public Double getSpentAmount() {
        return spentAmount;
    }

    public void setSpentAmount(Double spentAmount) {
        this.spentAmount = spentAmount;
    }

    public Double getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(Double remainingAmount) {
        this.remainingAmount = remainingAmount;
    }

    public Double getPercentUsed() {
        return percentUsed;
    }

    public void setPercentUsed(Double percentUsed) {
        this.percentUsed = percentUsed;
    }

    public boolean isOverBudget() {
        return overBudget;
    }

    public void setOverBudget(boolean overBudget) {
        this.overBudget = overBudget;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}