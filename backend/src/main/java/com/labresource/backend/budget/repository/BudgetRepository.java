package com.labresource.backend.budget.repository;

import com.labresource.backend.budget.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByInstitutionId(Long institutionId);
    List<Budget> findByInstitutionIdAndFiscalYear(Long institutionId, String fiscalYear);
    Optional<Budget> findByDepartmentIdAndFiscalYear(Long departmentId, String fiscalYear);
}
