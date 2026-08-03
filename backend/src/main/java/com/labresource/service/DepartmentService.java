package com.labresource.service;

import com.labresource.dto.department.DepartmentRequest;
import com.labresource.dto.department.DepartmentResponse;

import java.util.List;

public interface DepartmentService {

    DepartmentResponse createDepartment(
            DepartmentRequest request
    );

    List<DepartmentResponse> getAllDepartments();

    DepartmentResponse getDepartmentById(
            String departmentId
    );

    List<DepartmentResponse> getDepartmentsByInstitution(
            String institutionId
    );

    DepartmentResponse updateDepartment(
            String departmentId,
            DepartmentRequest request
    );

    void deleteDepartment(
            String departmentId
    );
}



//mwthod
//createDepartment
//        getAllDepartments
//getDepartmentById
//        getDepartmentsByInstitution
//updateDepartment
//        deleteDepartment