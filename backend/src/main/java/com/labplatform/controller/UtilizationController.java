package com.labplatform.controller;

import com.labplatform.dto.Dtos;
import com.labplatform.service.UtilizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UtilizationController {

    private final UtilizationService utilizationService;

    @GetMapping("/department-utilization")
    public List<Dtos.UtilizationStats> getUtilization() {
        return utilizationService.getFleetUtilization();
    }
}