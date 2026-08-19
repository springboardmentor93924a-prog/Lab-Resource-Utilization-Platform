package com.labplatform.billing.dto;

import java.math.BigDecimal;

public class DepartmentCostResponse {

    private String department;
    private BigDecimal totalCost;

    public DepartmentCostResponse() {
    }

    public DepartmentCostResponse(
            String department,
            BigDecimal totalCost) {

        this.department = department;
        this.totalCost = totalCost;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }
}