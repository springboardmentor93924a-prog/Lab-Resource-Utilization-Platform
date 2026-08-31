package com.labresource.controller;

import com.labresource.entity.Department;
import com.labresource.repository.DepartmentRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "http://localhost:5173")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    public DepartmentController(
            DepartmentRepository departmentRepository) {

        this.departmentRepository =
                departmentRepository;
    }

    @GetMapping
    public List<Department> getAllDepartments() {

        return departmentRepository.findAll();
    }

    @GetMapping("/institution/{institutionId}")
    public List<Department> getDepartmentsByInstitution(
            @PathVariable Long institutionId) {

        return departmentRepository
                .findByInstitutionId(institutionId);
    }
}