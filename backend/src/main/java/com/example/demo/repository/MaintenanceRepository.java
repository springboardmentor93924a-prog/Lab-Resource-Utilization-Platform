package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Maintenance;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Integer> {
    List<Maintenance> findByTechnician_UserId(Integer userId);
    List<Maintenance> findByEquipment_EquipmentId(Integer equipmentId);
}
