package com.example.lab_platform.dto;

public class DepartmentCostDTO {

    private Integer departmentId;
    private String departmentName;
    private double totalAllocatedCost;
    private long allocationCount;
    private double pendingAmount;
    private double paidAmount;

    public Integer getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Integer departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public double getTotalAllocatedCost() {
        return totalAllocatedCost;
    }

    public void setTotalAllocatedCost(double totalAllocatedCost) {
        this.totalAllocatedCost = totalAllocatedCost;
    }

    public long getAllocationCount() {
        return allocationCount;
    }

    public void setAllocationCount(long allocationCount) {
        this.allocationCount = allocationCount;
    }

    public double getPendingAmount() {
        return pendingAmount;
    }

    public void setPendingAmount(double pendingAmount) {
        this.pendingAmount = pendingAmount;
    }

    public double getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(double paidAmount) {
        this.paidAmount = paidAmount;
    }
}
