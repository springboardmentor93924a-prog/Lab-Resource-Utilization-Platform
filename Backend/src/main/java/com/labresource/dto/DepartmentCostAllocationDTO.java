package com.labresource.dto;

public class DepartmentCostAllocationDTO {

    private Long departmentId;
    private String departmentName;
    private Double usageHours;
    private Double totalCost;

    public DepartmentCostAllocationDTO() {
    }

    public DepartmentCostAllocationDTO(
            Long departmentId,
            String departmentName,
            Double usageHours,
            Double totalCost
    ) {
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.usageHours = usageHours;
        this.totalCost = totalCost;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public Double getUsageHours() {
        return usageHours;
    }

    public void setUsageHours(Double usageHours) {
        this.usageHours = usageHours;
    }

    public Double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(Double totalCost) {
        this.totalCost = totalCost;
    }
}