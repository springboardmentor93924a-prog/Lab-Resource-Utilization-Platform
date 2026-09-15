package com.labresource.backend.laboratory.repository;

import com.labresource.backend.laboratory.entity.Laboratory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LaboratoryRepository extends JpaRepository<Laboratory, Long> {
    List<Laboratory> findByDepartmentIdAndIsActiveTrue(Long departmentId);
    List<Laboratory> findByInstitutionIdAndIsActiveTrue(Long institutionId);
    List<Laboratory> findByDepartmentId(Long departmentId);
    /** Institution-scoped: both department AND institution must match. */
    List<Laboratory> findByDepartmentIdAndInstitutionIdAndIsActiveTrue(Long departmentId, Long institutionId);
}
