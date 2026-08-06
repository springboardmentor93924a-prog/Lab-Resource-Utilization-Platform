package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Maintenance;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.repository.MaintenanceRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.service.MaintenanceService;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaintenanceServiceImpl implements MaintenanceService {


    private final MaintenanceRepository maintenanceRepository;
    private final EquipmentRepository equipmentRepository;


    public MaintenanceServiceImpl(
            MaintenanceRepository maintenanceRepository,
            EquipmentRepository equipmentRepository) {

        this.maintenanceRepository = maintenanceRepository;
        this.equipmentRepository = equipmentRepository;
    }



    @Override
    public List<Maintenance> getAllMaintenance() {

        return maintenanceRepository.findAll();
    }



    @Override
    public Maintenance getMaintenanceById(Long id) {

        return maintenanceRepository.findById(id)
                .orElseThrow(() ->
                new RuntimeException("Maintenance not found"));
    }



    @Override
    public Maintenance createMaintenance(
            Maintenance maintenance) {


        Equipment equipment =
                maintenance.getEquipment();


        if(equipment != null) {

            equipment.setStatus("Under Maintenance");

            equipmentRepository.save(equipment);
        }


        maintenance.setMaintenanceStatus("Active");


        return maintenanceRepository.save(maintenance);
    }

}