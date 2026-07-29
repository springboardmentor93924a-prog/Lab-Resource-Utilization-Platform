package com.infosys.resource_utilization.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infosys.resource_utilization.entity.Equipment;
import com.infosys.resource_utilization.repository.EquipmentRepository;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public EquipmentService(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    public Equipment saveEquipment(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }
    public Equipment getEquipmentById(Long id) {
    return equipmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Equipment not found"));
}

public Equipment updateEquipment(Long id, Equipment equipment) {

    Equipment existing = getEquipmentById(id);

    existing.setName(equipment.getName());
    existing.setCategory(equipment.getCategory());
    existing.setStatus(equipment.getStatus());
    existing.setDepartment(equipment.getDepartment());
    existing.setDescription(equipment.getDescription());

    return equipmentRepository.save(existing);
}

public void deleteEquipment(Long id) {
    equipmentRepository.deleteById(id);
}
}