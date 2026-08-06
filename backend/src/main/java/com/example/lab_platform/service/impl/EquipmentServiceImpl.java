package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.service.EquipmentService;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentServiceImpl implements EquipmentService {


    private final EquipmentRepository equipmentRepository;


    public EquipmentServiceImpl(
            EquipmentRepository equipmentRepository) {

        this.equipmentRepository = equipmentRepository;
    }



    @Override
    public List<Equipment> getAllEquipment() {

        return equipmentRepository.findAll();
    }



    @Override
    public Equipment getEquipmentById(Integer id) {

        return equipmentRepository.findById(id)
                .orElseThrow(() ->
                new RuntimeException("Equipment not found"));
    }



    @Override
    public Equipment updateStatus(Integer id, String status) {

        Equipment equipment = getEquipmentById(id);

        equipment.setStatus(status);

        return equipmentRepository.save(equipment);
    }
}