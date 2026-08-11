package com.example.lab_platform.controller;

import com.example.lab_platform.dto.UtilizationDTO;
import com.example.lab_platform.service.UtilizationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UtilizationController {

    private final UtilizationService utilizationService;

    public UtilizationController(UtilizationService utilizationService) {
        this.utilizationService = utilizationService;
    }

    @PreAuthorize("""
        hasAnyRole(
            'LAB_MANAGER',
            'DEPARTMENT_HEAD',
            'INSTITUTION_ADMIN',
            'SYSTEM_ADMIN'
        )
        """)
    @GetMapping("/utilization")
    public List<UtilizationDTO> getUtilization() {
        return utilizationService.getUtilizationData();
    }
}