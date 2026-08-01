 package com.example.lab_platform.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    // Get all roles (Admin only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public String getAllRoles() {
        return "List of all roles (Admin only)";
    }

    // Create a new role (Admin only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public String createRole() {
        return "New role created successfully (Admin only)";
    }
}