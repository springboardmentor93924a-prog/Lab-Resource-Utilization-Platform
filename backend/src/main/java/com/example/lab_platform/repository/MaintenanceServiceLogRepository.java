package com.example.lab_platform.repository;

import com.example.lab_platform.entity.MaintenanceServiceLog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceServiceLogRepository extends JpaRepository<MaintenanceServiceLog, Integer> {

    List<MaintenanceServiceLog> findByWorkOrder_WorkOrderId(Integer workOrderId);

    // Full service history for a piece of equipment, across every work
    // order ever raised against it — this is the "maintenance history"
    // view (newest first).
    @Query("SELECT l FROM MaintenanceServiceLog l " +
            "WHERE l.workOrder.equipment.equipmentId = :equipmentId " +
            "ORDER BY l.serviceDate DESC")
    List<MaintenanceServiceLog> findHistoryByEquipmentId(@Param("equipmentId") Integer equipmentId);

    List<MaintenanceServiceLog> findByTechnician_UserId(Integer technicianId);
}
