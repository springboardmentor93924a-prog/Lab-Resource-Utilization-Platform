package com.example.lab_platform.controller;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.service.EquipmentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "http://localhost:5173")
public class EquipmentController {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentService equipmentService;

    public EquipmentController(
            EquipmentRepository equipmentRepository,
            EquipmentService equipmentService) {

        this.equipmentRepository =
                equipmentRepository;

        this.equipmentService =
                equipmentService;
    }

    @GetMapping
    public ResponseEntity<List<Equipment>>
    getAllEquipment() {

        return ResponseEntity.ok(
                equipmentService.getAllEquipment()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipment>
    getEquipmentById(
            @PathVariable Integer id) {

        try {

            return ResponseEntity.ok(
                    equipmentService.getEquipmentById(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Equipment>
    createEquipment(
            @RequestBody Equipment equipment) {

        if (equipment.getStatus() == null
                || equipment.getStatus().isBlank()) {

            equipment.setStatus("Available");
        }

        Equipment savedEquipment =
                equipmentRepository.save(equipment);

        return ResponseEntity.ok(
                savedEquipment
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Equipment>
    updateEquipment(
            @PathVariable Integer id,
            @RequestBody Equipment updatedEquipment) {

        return equipmentRepository
                .findById(id)
                .map(eq -> {

                    eq.setEquipmentName(
                            updatedEquipment.getEquipmentName()
                    );

                    eq.setCategory(
                            updatedEquipment.getCategory()
                    );

                    eq.setSerialNumber(
                            updatedEquipment.getSerialNumber()
                    );

                    eq.setLocation(
                            updatedEquipment.getLocation()
                    );

                    eq.setPurchaseDate(
                            updatedEquipment.getPurchaseDate()
                    );

                    Equipment saved =
                            equipmentRepository.save(eq);

                    return ResponseEntity.ok(saved);

                })
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteEquipment(
            @PathVariable Integer id) {

        if (equipmentRepository.existsById(id)) {

            equipmentRepository.deleteById(id);

            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }
}