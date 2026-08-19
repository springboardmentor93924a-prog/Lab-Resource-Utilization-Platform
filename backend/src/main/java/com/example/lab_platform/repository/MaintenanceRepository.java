package com.example.lab_platform.repository;

import com.example.lab_platform.entity.Maintenance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository
        extends JpaRepository<Maintenance, Long> {

    List<Maintenance> findByMaintenanceStatus(
            String maintenanceStatus
    );

    List<Maintenance> findByEquipment_EquipmentId(
            Integer equipmentId
    );

    List<Maintenance> findByAssignedTechnician_UserId(
            Integer userId
    );
}