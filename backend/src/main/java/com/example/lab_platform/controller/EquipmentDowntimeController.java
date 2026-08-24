package com.example.lab_platform.controller;

import com.example.lab_platform.dto.EquipmentDowntimeDTO;
import com.example.lab_platform.entity.EquipmentDowntime;
import com.example.lab_platform.service.EquipmentDowntimeService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/equipment-downtime")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
public class EquipmentDowntimeController {

    private final EquipmentDowntimeService equipmentDowntimeService;

    public EquipmentDowntimeController(EquipmentDowntimeService equipmentDowntimeService) {
        this.equipmentDowntimeService = equipmentDowntimeService;
    }

    @GetMapping
    public List<EquipmentDowntimeDTO> getAllDowntime() {
        return equipmentDowntimeService.getAllDowntime()
                .stream()
                .map(EquipmentDowntimeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Downtime history for one piece of equipment (used on the
    // Equipment detail / Reports pages). Duration for each entry is
    // computed only from its stored start/end timestamps — never live.
    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<EquipmentDowntimeDTO>> getDowntimeForEquipment(
            @PathVariable Integer equipmentId) {
        List<EquipmentDowntimeDTO> downtime = equipmentDowntimeService.getDowntimeForEquipment(equipmentId)
                .stream()
                .map(EquipmentDowntimeDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(downtime);
    }

    // Manually log a downtime window not tied to a work order (e.g. an
    // unplanned outage discovered directly by a technician).
    @PostMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<EquipmentDowntimeDTO> logDowntime(@RequestBody EquipmentDowntime downtime) {
        return ResponseEntity.ok(EquipmentDowntimeDTO.fromEntity(equipmentDowntimeService.logDowntime(downtime)));
    }

    // Close an open downtime window by hand. Sets endDate to now and
    // stores it — duration is then computed from that stored pair.
    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<EquipmentDowntimeDTO> resolveDowntime(@PathVariable Integer id) {
        return ResponseEntity.ok(EquipmentDowntimeDTO.fromEntity(equipmentDowntimeService.resolveDowntime(id)));
    }
}
