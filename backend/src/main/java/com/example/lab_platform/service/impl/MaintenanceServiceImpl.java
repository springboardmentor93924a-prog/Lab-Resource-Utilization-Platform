package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.Maintenance;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.MaintenanceRepository;
import com.example.lab_platform.repository.UserRepository;
import com.example.lab_platform.service.MaintenanceService;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MaintenanceServiceImpl implements MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    public MaintenanceServiceImpl(
            MaintenanceRepository maintenanceRepository,
            EquipmentRepository equipmentRepository,
            UserRepository userRepository) {

        this.maintenanceRepository = maintenanceRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<Maintenance> getAllMaintenance() {
        return maintenanceRepository.findAll();
    }

    @Override
    public Maintenance getMaintenanceById(Integer id) {
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance record not found: " + id));
    }

    @Override
    public List<Maintenance> getMaintenanceForEquipment(Integer equipmentId) {
        return maintenanceRepository.findByEquipment_EquipmentIdOrderByMaintenanceDateDesc(equipmentId);
    }

    @Override
    public List<Maintenance> getUpcomingMaintenance() {
        return maintenanceRepository.findByNextMaintenanceDateLessThanEqualAndMaintenanceStatusNot(
                LocalDate.now(), "Completed");
    }

    @Override
    public Maintenance scheduleMaintenance(Maintenance maintenance) {

        if (maintenance.getEquipment() != null && maintenance.getEquipment().getEquipmentId() != null) {
            Integer equipmentId = maintenance.getEquipment().getEquipmentId();
            Equipment equipment = equipmentRepository.findById(equipmentId)
                    .orElseThrow(() -> new RuntimeException("Equipment not found: " + equipmentId));
            maintenance.setEquipment(equipment);
        }

        resolveAssignedTechnician(maintenance);

        if (maintenance.getMaintenanceDate() == null) {
            maintenance.setMaintenanceDate(LocalDate.now());
        }
        if (maintenance.getMaintenanceStatus() == null || maintenance.getMaintenanceStatus().isBlank()) {
            maintenance.setMaintenanceStatus("Scheduled");
        }

        return maintenanceRepository.save(maintenance);
    }

    @Override
    public Maintenance updateMaintenance(Integer id, Maintenance updatedMaintenance) {

        Maintenance existing = getMaintenanceById(id);

        if (updatedMaintenance.getMaintenanceType() != null) {
            existing.setMaintenanceType(updatedMaintenance.getMaintenanceType());
        }
        if (updatedMaintenance.getDescription() != null) {
            existing.setDescription(updatedMaintenance.getDescription());
        }
        if (updatedMaintenance.getMaintenanceStatus() != null) {
            existing.setMaintenanceStatus(updatedMaintenance.getMaintenanceStatus());
        }
        if (updatedMaintenance.getMaintenanceDate() != null) {
            existing.setMaintenanceDate(updatedMaintenance.getMaintenanceDate());
        }
        if (updatedMaintenance.getNextMaintenanceDate() != null) {
            existing.setNextMaintenanceDate(updatedMaintenance.getNextMaintenanceDate());
        }
        if (updatedMaintenance.getAssignedTechnician() != null
                && updatedMaintenance.getAssignedTechnician().getUserId() != null) {
            resolveAssignedTechnician(updatedMaintenance);
            existing.setAssignedTechnician(updatedMaintenance.getAssignedTechnician());
        }

        return maintenanceRepository.save(existing);
    }

    private void resolveAssignedTechnician(Maintenance maintenance) {
        if (maintenance.getAssignedTechnician() != null
                && maintenance.getAssignedTechnician().getUserId() != null) {
            Integer technicianId = maintenance.getAssignedTechnician().getUserId();
            User technician = userRepository.findById(technicianId)
                    .orElseThrow(() -> new RuntimeException("Technician not found: " + technicianId));
            maintenance.setAssignedTechnician(technician);
        }
    }
}
