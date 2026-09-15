package com.labresource.backend.budget.repository;

import com.labresource.backend.budget.entity.BudgetRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BudgetRequestRepository extends JpaRepository<BudgetRequest, Long> {
    List<BudgetRequest> findByDepartmentIdOrderByCreatedAtDesc(Long departmentId);
    List<BudgetRequest> findByInstitutionIdOrderByCreatedAtDesc(Long institutionId);
    List<BudgetRequest> findByInstitutionIdAndStatusOrderByCreatedAtDesc(Long institutionId, String status);
}
