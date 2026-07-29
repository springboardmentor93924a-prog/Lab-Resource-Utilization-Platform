package com.infosys.resource_utilization.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.resource_utilization.entity.Equipment;
import com.infosys.resource_utilization.service.EquipmentService;

@RestController
@RequestMapping("/equipment")
public class EquipmentController {

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    // GET All Equipment
    @GetMapping
    public List<Equipment> getAllEquipment() {
        return equipmentService.getAllEquipment();
    }

    // GET Equipment By ID
    @GetMapping("/{id}")
    public Equipment getEquipment(@PathVariable Long id) {
        return equipmentService.getEquipmentById(id);
    }

    // CREATE Equipment
    @PostMapping
    public Equipment addEquipment(@Valid @RequestBody Equipment equipment) {
        return equipmentService.saveEquipment(equipment);
    }

    // UPDATE Equipment
    @PutMapping("/{id}")
    public Equipment updateEquipment(@PathVariable Long id,
                                    @Valid @RequestBody Equipment equipment) {
        return equipmentService.updateEquipment(id, equipment);
    }

    // DELETE Equipment
    @DeleteMapping("/{id}")
    public String deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
        return "Equipment deleted successfully";
    }
}