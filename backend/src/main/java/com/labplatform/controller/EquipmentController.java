package com.labplatform.controller;

import com.labplatform.entity.Equipment;
import com.labplatform.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EquipmentController {

    private final EquipmentRepository equipmentRepository;

    @GetMapping
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    @PostMapping
    public Equipment addEquipment(@RequestBody Equipment equipment) {
        return equipmentRepository.save(equipment);
    }
}