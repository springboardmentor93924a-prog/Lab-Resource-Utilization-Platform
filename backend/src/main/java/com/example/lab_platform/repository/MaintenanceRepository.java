package com.example.lab_platform.repository;

import com.example.lab_platform.entity.Maintenance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Integer> {

    List<Maintenance> findByEquipment_EquipmentIdOrderByMaintenanceDateDesc(Integer equipmentId);

    List<Maintenance> findByMaintenanceStatus(String maintenanceStatus);

    List<Maintenance> findByAssignedTechnician_UserId(Integer technicianId);

    // Preventive-maintenance items due on/before the given date and not
    // yet completed — backs the "upcoming maintenance" view.
    List<Maintenance> findByNextMaintenanceDateLessThanEqualAndMaintenanceStatusNot(
            LocalDate date, String maintenanceStatus);
}
