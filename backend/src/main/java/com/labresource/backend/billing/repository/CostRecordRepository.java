package com.labresource.backend.billing.repository;

import com.labresource.backend.billing.entity.CostRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CostRecordRepository extends JpaRepository<CostRecord, Long> {
    List<CostRecord> findByDepartmentId(Long departmentId);
    List<CostRecord> findByInstitutionId(Long institutionId);
}
