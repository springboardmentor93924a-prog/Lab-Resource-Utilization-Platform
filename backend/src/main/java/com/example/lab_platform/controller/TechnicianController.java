package com.example.lab_platform.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/technician")
public class TechnicianController {

    @GetMapping("/dashboard")
    public String technicianDashboard() {
        return "Lab Technician access granted";
    }
}
