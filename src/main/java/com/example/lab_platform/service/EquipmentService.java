package com.example.lab_platform.service;

import com.example.lab_platform.dto.EquipmentDTO;
import java.util.List;

public interface EquipmentService {
    EquipmentDTO createEquipment(EquipmentDTO equipmentDTO);
    List<EquipmentDTO> getAllEquipment();
    EquipmentDTO getEquipmentById(Long id);
}