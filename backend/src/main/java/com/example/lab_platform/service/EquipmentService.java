package com.example.lab_platform.service;

import com.example.lab_platform.entity.Equipment;
import java.util.List;

public interface EquipmentService {

    List<Equipment> getAllEquipment();

    Equipment getEquipmentById(Integer id);

    Equipment updateStatus(Integer id, String status);
}