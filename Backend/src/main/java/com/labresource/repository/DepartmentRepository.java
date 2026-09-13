package com.labresource.repository;

import com.labresource.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentRepository
        extends JpaRepository<Department, Long> {

    List<Department> findByInstitutionId(
            Long institutionId
    );
}