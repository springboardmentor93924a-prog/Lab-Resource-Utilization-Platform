package com.example.lab_platform.repository;

import com.example.lab_platform.entity.Budget;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Integer> {

    List<Budget> findByInstitution_InstitutionId(Integer institutionId);

    List<Budget> findByDepartment_DepartmentId(Integer departmentId);
}