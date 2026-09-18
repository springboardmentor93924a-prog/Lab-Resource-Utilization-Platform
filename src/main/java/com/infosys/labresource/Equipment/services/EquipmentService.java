package com.infosys.labresource.Equipment.services;

import com.infosys.labresource.Equipment.dtos.EquipmentRequestDTO;
import com.infosys.labresource.Equipment.dtos.EquipmentResponseDTO;
import com.infosys.labresource.Equipment.entity.EquipmentStatus;

import java.util.List;

public interface EquipmentService {
    EquipmentResponseDTO addEquipment(EquipmentRequestDTO requestDTO);

    List<EquipmentResponseDTO> getAllEquipment(String email);

    EquipmentResponseDTO getEquipmentById(Long equipmentId);

    EquipmentResponseDTO updateEquipment(Long equipmentId,
                                         EquipmentRequestDTO requestDTO);

    void deleteEquipment(Long equipmentId);
    List<EquipmentResponseDTO> getEquipmentByStatus(EquipmentStatus status);
}
