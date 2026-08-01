package com.example.lab_platform.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    // Get list of all users (Admin or Staff)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public String getAllUsers() {
        return "List of all users (Admin or Staff)";
    }

    // Get user profile by ID (Authenticated users can view their own or profile)
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public String getUserById(@PathVariable Long id) {
        return "User profile details for ID (Authenticated user): " + id;
    }

    // Delete a user (Admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteUser(@PathVariable Long id) {
        return "User deleted successfully (Admin only): " + id;
    }
}