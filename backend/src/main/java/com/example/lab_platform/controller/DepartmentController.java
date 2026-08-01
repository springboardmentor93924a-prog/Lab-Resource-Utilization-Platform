package com.example.lab_platform.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public String getAllDepartments() {
        return "List of all departments";
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public String createDepartment() {
        return "New department added (Admin only)";
    }
}