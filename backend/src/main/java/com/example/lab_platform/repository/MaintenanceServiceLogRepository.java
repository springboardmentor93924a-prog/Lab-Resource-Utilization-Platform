package com.example.lab_platform.repository;

import com.example.lab_platform.entity.MaintenanceServiceLog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceServiceLogRepository extends JpaRepository<MaintenanceServiceLog, Integer> {

    List<MaintenanceServiceLog> findByWorkOrder_Equipment_EquipmentId(Integer equipmentId);
}