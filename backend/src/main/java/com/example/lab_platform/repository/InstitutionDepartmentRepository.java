package com.example.lab_platform.repository;

import com.example.lab_platform.entity.InstitutionDepartment;
import com.example.lab_platform.entity.InstitutionDepartmentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InstitutionDepartmentRepository
        extends JpaRepository<
                InstitutionDepartment,
                InstitutionDepartmentId> {

    List<InstitutionDepartment> findByInstitutionInstitutionId(
            Integer institutionId);

    boolean existsByInstitutionInstitutionIdAndDepartmentDepartmentId(
            Integer institutionId,
            Integer departmentId);
}