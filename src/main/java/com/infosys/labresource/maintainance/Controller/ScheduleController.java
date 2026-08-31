package com.infosys.labresource.maintainance.Controller;

import com.infosys.labresource.maintainance.Entities.MaintenanceSchedule;
import com.infosys.labresource.maintainance.Service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance/schedules")
@RequiredArgsConstructor
public class ScheduleController {
    private final ScheduleService scheduleService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('LAB_MANAGER')")
    public ResponseEntity<MaintenanceSchedule> createSchedule(@RequestParam Long requestId, @RequestParam LocalDateTime start, @RequestParam LocalDateTime end) {

        MaintenanceSchedule schedule = scheduleService.createSchedule(requestId, start, end);

        return new ResponseEntity<>(schedule, HttpStatus.CREATED);
    }

    @GetMapping("/{scheduleId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MaintenanceSchedule> getSchedule(@PathVariable Long scheduleId) {

        return ResponseEntity.ok(scheduleService.getSchedule(scheduleId));
    }
    @GetMapping("/equipment/{equipmentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MaintenanceSchedule>> getEquipmentSchedules(@PathVariable Long equipmentId) {

        return ResponseEntity.ok(scheduleService.getEquipmentSchedules(equipmentId));
    }
}
