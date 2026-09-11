package com.example.lab_platform.controller;

import com.example.lab_platform.entity.Role;
import com.example.lab_platform.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = "${app.frontend-base-url}")
public class RoleController {

    @Autowired
    private RoleRepository roleRepository;

    // =========================================================
    // GET ALL ROLES
    // Left public — Register.jsx needs this before the user
    // has a token, to populate the role dropdown.
    // =========================================================
    @GetMapping
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    // =========================================================
    // CREATE A NEW ROLE
    // Only System Administrators should be able to define
    // new roles in the system.
    // =========================================================
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @PostMapping
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        Role savedRole = roleRepository.save(role);
        return ResponseEntity.ok(savedRole);
    }
}