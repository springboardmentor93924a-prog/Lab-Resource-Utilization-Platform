package com.labresource.backend.department.repository;

import com.labresource.backend.department.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByInstitutionId(Long institutionId);
    List<Department> findByInstitutionIdAndIsActiveTrue(Long institutionId);
    Optional<Department> findByInstitutionIdAndNameIgnoreCase(Long institutionId, String name);
    Optional<Department> findByInstitutionIdAndCodeIgnoreCase(Long institutionId, String code);
}
