 package com.example.lab_platform.controller;

import com.example.lab_platform.dto.UtilizationDTO;
import com.example.lab_platform.service.UtilizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class UtilizationController {

    @Autowired
    private UtilizationService utilizationService;

    @GetMapping("/utilization")
    public List<UtilizationDTO> getUtilization() {
        return utilizationService.getUtilizationData();
    }
}