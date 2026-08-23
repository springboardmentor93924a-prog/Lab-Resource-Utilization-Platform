package com.labresource.backend.maintenance.repository;

import com.labresource.backend.maintenance.entity.MaintenanceAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MaintenanceAssignmentRepository extends JpaRepository<MaintenanceAssignment, Long> {
    List<MaintenanceAssignment> findByTechnicianIdAndStatus(Long technicianId, String status);
    List<MaintenanceAssignment> findByMaintenanceIdAndStatus(Long maintenanceId, String status);
    Optional<MaintenanceAssignment> findByMaintenanceIdAndTechnicianIdAndStatus(Long maintenanceId, Long technicianId, String status);
    List<MaintenanceAssignment> findByMaintenanceId(Long maintenanceId);
}

