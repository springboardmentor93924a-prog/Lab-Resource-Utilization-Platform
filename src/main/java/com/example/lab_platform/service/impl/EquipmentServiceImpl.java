package com.example.lab_platform.service.impl;

import com.example.lab_platform.dto.EquipmentDTO;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.service.EquipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EquipmentServiceImpl implements EquipmentService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Override
    public EquipmentDTO createEquipment(EquipmentDTO equipmentDTO) {
        Equipment equipment = new Equipment();
        equipment.setName(equipmentDTO.getName());
        equipment.setSerialNumber(equipmentDTO.getSerialNumber());
        equipment.setStatus(equipmentDTO.getStatus());
        
        Equipment saved = equipmentRepository.save(equipment);
        equipmentDTO.setId(saved.getId());
        return equipmentDTO;
    }

    @Override
    public List<EquipmentDTO> getAllEquipment() {
        return equipmentRepository.findAll().stream().map(eq -> {
            EquipmentDTO dto = new EquipmentDTO();
            dto.setId(eq.getId());
            dto.setName(eq.getName());
            dto.setSerialNumber(eq.getSerialNumber());
            dto.setStatus(eq.getStatus());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public EquipmentDTO getEquipmentById(Long id) {
        Equipment eq = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        EquipmentDTO dto = new EquipmentDTO();
        dto.setId(eq.getId());
        dto.setName(eq.getName());
        dto.setSerialNumber(eq.getSerialNumber());
        dto.setStatus(eq.getStatus());
        return dto;
    }
}