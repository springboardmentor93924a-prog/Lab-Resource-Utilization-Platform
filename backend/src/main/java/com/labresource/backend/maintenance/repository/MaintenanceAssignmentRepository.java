package com.labresource.backend.maintenance.repository;

import com.labresource.backend.maintenance.entity.MaintenanceAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceAssignmentRepository extends JpaRepository<MaintenanceAssignment, Long> {
    List<MaintenanceAssignment> findByTechnicianIdAndStatus(Long technicianId, String status);
}
