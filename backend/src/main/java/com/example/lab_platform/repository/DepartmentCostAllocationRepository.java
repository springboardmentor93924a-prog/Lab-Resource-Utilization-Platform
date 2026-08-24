package com.example.lab_platform.repository;

import com.example.lab_platform.entity.DepartmentCostAllocation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentCostAllocationRepository
        extends JpaRepository<DepartmentCostAllocation, Integer> {

    Optional<DepartmentCostAllocation> findByUsageCost_UsageCostId(Integer usageCostId);

    List<DepartmentCostAllocation> findByDepartment_DepartmentId(Integer departmentId);
}