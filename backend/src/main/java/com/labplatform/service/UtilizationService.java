package com.labplatform.service;

import com.labplatform.dto.Dtos;
import com.labplatform.entity.Equipment;
import com.labplatform.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UtilizationService {

    private final EquipmentRepository equipmentRepository;

    public List<Dtos.UtilizationStats> getFleetUtilization() {
        List<Equipment> equipmentList = equipmentRepository.findAll();

        return equipmentList.stream().map(eq -> Dtos.UtilizationStats.builder()
                .equipmentId(eq.getId())
                .equipmentName(eq.getName())
                .totalHoursBooked(36.0)
                .totalCapacityHours(168.0)
                .utilizationPercentage(21.4)
                .idleHours(132.0)
                .build()
        ).collect(Collectors.toList());
    }
}