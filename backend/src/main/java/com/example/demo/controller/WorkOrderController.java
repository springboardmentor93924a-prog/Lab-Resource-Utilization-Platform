package com.example.demo.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Equipment;
import com.example.demo.entity.Maintenance;
import com.example.demo.entity.User;
import com.example.demo.repository.EquipmentRepository;
import com.example.demo.repository.MaintenanceRepository;
import com.example.demo.repository.UserRepository;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    @Autowired private MaintenanceRepository maintenanceRepository;
    @Autowired private EquipmentRepository equipmentRepository;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return maintenanceRepository.findAll()
                .stream().map(this::toResponse).collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/my")
    public List<Map<String, Object>> myAssigned(java.security.Principal principal) {
        User me = userRepository.findByEmail(principal.getName()).orElse(null);
        if (me == null) return List.of();
        return maintenanceRepository.findByTechnician_UserId(me.getUserId())
                .stream().map(this::toResponse).collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/equipment/{equipmentId}")
    public List<Map<String, Object>> byEquipment(@PathVariable Integer equipmentId) {
        return maintenanceRepository.findByEquipment_EquipmentId(equipmentId)
                .stream().map(this::toResponse).collect(java.util.stream.Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        Object equipmentIdRaw = body.get("equipmentId");
        String issueDescription = (String) body.get("issueDescription");
        String priority = (String) body.getOrDefault("priority", "MEDIUM");
        if (equipmentIdRaw == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "equipmentId is required"));
        }
        Integer equipmentId = Integer.valueOf(equipmentIdRaw.toString());
        Equipment equipment = equipmentRepository.findById(equipmentId).orElse(null);
        if (equipment == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Equipment not found"));
        }

        Maintenance m = new Maintenance();
        m.setEquipment(equipment);
        m.setMaintenanceDate(LocalDate.now());
        m.setMaintenanceType("Repair");
        m.setNotes(issueDescription);
        m.setPriority(priority);
        m.setStatus("Scheduled");
        m.setCreatedAt(LocalDateTime.now());
        maintenanceRepository.save(m);

        equipment.setStatus("Under Maintenance");
        equipment.setUpdatedAt(LocalDateTime.now());
        equipmentRepository.save(equipment);

        return ResponseEntity.ok(toResponse(m));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMINISTRATOR') or hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<?> assign(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Maintenance m = maintenanceRepository.findById(id).orElse(null);
        if (m == null) return ResponseEntity.status(404).body(Map.of("error", "Work order not found"));
        Object techIdRaw = body.get("technicianUserId");
        if (techIdRaw == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "technicianUserId is required"));
        }
        Integer techId = Integer.valueOf(techIdRaw.toString());
        User technician = userRepository.findById(techId).orElse(null);
        if (technician == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Technician not found"));
        }
        m.setTechnician(technician);
        m.setStatus("In Progress");
        maintenanceRepository.save(m);
        return ResponseEntity.ok(toResponse(m));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMINISTRATOR') or hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<?> complete(@PathVariable Integer id) {
        Maintenance m = maintenanceRepository.findById(id).orElse(null);
        if (m == null) return ResponseEntity.status(404).body(Map.of("error", "Work order not found"));
        m.setStatus("Completed");
        maintenanceRepository.save(m);

        Equipment eq = m.getEquipment();
        eq.setStatus("Available");
        eq.setUpdatedAt(LocalDateTime.now());
        equipmentRepository.save(eq);

        return ResponseEntity.ok(toResponse(m));
    }

    private Map<String, Object> toResponse(Maintenance m) {
        Map<String, Object> r = new java.util.HashMap<>();
        r.put("id", m.getMaintenanceId());
        r.put("equipmentName", m.getEquipment() != null ? m.getEquipment().getName() : null);
        r.put("issueDescription", m.getNotes());
        r.put("priority", m.getPriority());
        r.put("status", m.getStatus());
        r.put("assignedToName", m.getTechnician() != null
                ? (m.getTechnician().getFirstName() + " " + m.getTechnician().getLastName()) : null);
        return r;
    }
}
