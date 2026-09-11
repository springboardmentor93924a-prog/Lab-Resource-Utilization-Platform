package com.example.lab_platform.controller;

import com.example.lab_platform.entity.Department;
import com.example.lab_platform.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "${app.frontend-base-url}")
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    // Get all departments (Publicly accessible so Register.jsx can fetch dropdown options)
    @GetMapping
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    // Create a new department (Restricted to Institution and System Administrators)
    @PostMapping
    @PreAuthorize("hasAnyRole('INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        Department savedDepartment = departmentRepository.save(department);
        return ResponseEntity.ok(savedDepartment);
    }
}