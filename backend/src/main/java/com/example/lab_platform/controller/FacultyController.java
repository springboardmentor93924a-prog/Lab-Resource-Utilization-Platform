package com.example.lab_platform.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    @GetMapping("/dashboard")
    public String facultyDashboard() {
        return "Faculty access granted";
    }
}
