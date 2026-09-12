package com.example.demo.controller;

import com.example.demo.entity.Utilization;
import com.example.demo.repository.UtilizationRepository;
import com.example.demo.repository.EquipmentRepository;
import com.example.demo.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/utilization")
public class UtilizationController {

    @Autowired private UtilizationRepository utilizationRepository;
    @Autowired private EquipmentRepository equipmentRepository;
    @Autowired private DepartmentRepository departmentRepository;

    @GetMapping("/summary")
    public List<Map<String, Object>> utilizationSummary() {
        List<com.example.demo.entity.Equipment> allEquipment = equipmentRepository.findAll();
        return allEquipment.stream().map(eq -> {
            List<Utilization> logs = utilizationRepository.findByEquipment_EquipmentId(eq.getEquipmentId());
            double totalHours = logs.stream().mapToDouble(u -> u.getHoursUsed().doubleValue()).sum();
            double availableHours = 24.0 * 30;
            double rate = availableHours > 0 ? (totalHours / availableHours) * 100 : 0;

            String rawStatus = eq.getStatus();
            String normalizedStatus;
            if (rawStatus == null) {
                normalizedStatus = "UNKNOWN";
            } else {
                switch (rawStatus) {
                    case "Available": normalizedStatus = "AVAILABLE"; break;
                    case "Booked": normalizedStatus = "IN_USE"; break;
                    case "Under Maintenance": normalizedStatus = "MAINTENANCE"; break;
                    case "Outof Service": normalizedStatus = "OUT_OF_SERVICE"; break;
                    case "Retired": normalizedStatus = "RETIRED"; break;
                    default: normalizedStatus = rawStatus.toUpperCase().replace(" ", "_");
                }
            }

            java.util.Optional<LocalDate> lastUsage = logs.stream()
                    .map(Utilization::getUsageDate)
                    .filter(java.util.Objects::nonNull)
                    .max(LocalDate::compareTo);

            Long daysIdle = lastUsage.map(d ->
                    java.time.temporal.ChronoUnit.DAYS.between(d, LocalDate.now())
            ).orElse(null);

            boolean isIdle = logs.isEmpty() || (daysIdle != null && daysIdle >= 14);
            boolean highDemand = logs.size() >= 3;

            Map<String, Object> row = new java.util.LinkedHashMap<>();
            row.put("equipmentId", eq.getEquipmentId());
            row.put("equipmentName", eq.getName());
            row.put("imageUrl", eq.getImageUrl());
            row.put("status", normalizedStatus);
            row.put("usageHours", totalHours);
            row.put("utilizationRate", Math.round(rate * 100.0) / 100.0);
            row.put("totalBookings", logs.size());
            row.put("highDemand", highDemand);
            row.put("isIdle", isIdle);
            row.put("daysIdle", daysIdle);
            return row;
        }).collect(java.util.stream.Collectors.toList());
    }

    @GetMapping
    public List<Utilization> getAll() {
        return utilizationRepository.findAll();
    }

    @GetMapping("/equipment/{equipmentId}")
    public List<Utilization> getByEquipment(@PathVariable Integer equipmentId) {
        return utilizationRepository.findByEquipment_EquipmentId(equipmentId);
    }

    @PostMapping
    public ResponseEntity<?> logUsage(@RequestBody Utilization usage) {
        if (!equipmentRepository.existsById(usage.getEquipment().getEquipmentId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid equipmentId"));
        }
        if (!departmentRepository.existsById(usage.getDepartment().getDepartmentId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid departmentId"));
        }
        usage.setEquipment(equipmentRepository.findById(usage.getEquipment().getEquipmentId()).get());
        usage.setDepartment(departmentRepository.findById(usage.getDepartment().getDepartmentId()).get());
        usage.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(utilizationRepository.save(usage));
    }
}