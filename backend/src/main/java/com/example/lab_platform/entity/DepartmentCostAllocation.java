 package com.example.lab_platform.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "department_cost_allocations")
public class DepartmentCostAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "allocation_id")
    private Integer allocationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usage_cost_id")
    private EquipmentUsageCost usageCost;

    @Column(name = "allocation_date", nullable = false)
    private LocalDate allocationDate;

    @Column(name = "allocated_amount", nullable = false)
    private Double allocatedAmount;

    @Column(name = "allocation_status", length = 30)
    private String allocationStatus;

    @Column(name = "remarks")
    private String remarks;

    public DepartmentCostAllocation() {
    }

    public Integer getAllocationId() {
        return allocationId;
    }

    public void setAllocationId(Integer allocationId) {
        this.allocationId = allocationId;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public EquipmentUsageCost getUsageCost() {
        return usageCost;
    }

    public void setUsageCost(EquipmentUsageCost usageCost) {
        this.usageCost = usageCost;
    }

    public LocalDate getAllocationDate() {
        return allocationDate;
    }

    public void setAllocationDate(LocalDate allocationDate) {
        this.allocationDate = allocationDate;
    }

    public Double getAllocatedAmount() {
        return allocatedAmount;
    }

    public void setAllocatedAmount(Double allocatedAmount) {
        this.allocatedAmount = allocatedAmount;
    }

    public String getAllocationStatus() {
        return allocationStatus;
    }

    public void setAllocationStatus(String allocationStatus) {
        this.allocationStatus = allocationStatus;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}