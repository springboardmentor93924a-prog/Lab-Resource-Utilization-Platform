package com.labplatform.controller;

import com.labplatform.dto.Dtos;
import com.labplatform.entity.MaintenanceTask;
import com.labplatform.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping
    public List<MaintenanceTask> getAllTasks() {
        return maintenanceService.getAllTasks();
    }

    @PostMapping
    public MaintenanceTask scheduleTask(@RequestBody Dtos.MaintenanceRequest req) {
        return maintenanceService.scheduleTask(req);
    }

    @PostMapping("/{id}/complete")
    public MaintenanceTask completeTask(@PathVariable Long id, @RequestBody Dtos.MaintenanceCompleteRequest req) {
        return maintenanceService.completeTask(id, req.serviceNotes());
    }
}