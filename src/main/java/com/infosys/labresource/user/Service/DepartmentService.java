package com.infosys.labresource.user.Service;

import com.infosys.labresource.user.entites.Department;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface DepartmentService {
    Department createDepartment(Department department,
                               Authentication authentication);
    List<Department> getAllDepartments(Authentication authentication);
    Department getDepartmentById(Long id);
    Department getDepartmentByName(String departmentName);
    Department updateDepartment(Long id, Department request, Authentication authentication);

    void deleteDepartment(Long id, Authentication authentication);
    List<Department> getDepartmentsByInstitution(Long institutionId);
}
