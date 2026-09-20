package com.labresource.backend.controller;

import com.labresource.backend.entity.Equipment;
import com.labresource.backend.service.EquipmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "*")
public class EquipmentController {

    private final EquipmentService service;

    public EquipmentController(EquipmentService service){
        this.service=service;
    }

    @PostMapping
    public Equipment save(@RequestBody Equipment equipment){
        return service.save(equipment);
    }

    @GetMapping
    public List<Equipment> getAll(){
        return service.getAll();
    }

}