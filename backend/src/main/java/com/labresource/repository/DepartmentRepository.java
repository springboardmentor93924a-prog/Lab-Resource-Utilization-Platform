package com.labresource.repository;

import com.labresource.entity.Department;
import com.labresource.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, String> {

    List<Department> findByInstitution(Institution institution);

    boolean existsByNameAndInstitution(String name, Institution institution);

}