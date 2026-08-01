package com.example.lab_platform.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public String getAllEquipment() {
        return "List of all equipment";
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public String addEquipment() {
        return "New equipment added (Admin or Staff)";
    }
}