package com.labresource.backend.service;

import com.labresource.backend.entity.Equipment;
import com.labresource.backend.repository.EquipmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentService {

    private final EquipmentRepository repository;

    public EquipmentService(EquipmentRepository repository) {
        this.repository = repository;
    }

    public Equipment save(Equipment equipment){
        return repository.save(equipment);
    }

    public List<Equipment> getAll(){
        return repository.findAll();
    }

}