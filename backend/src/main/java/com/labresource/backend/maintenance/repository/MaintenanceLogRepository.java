package com.labresource.backend.maintenance.repository;

import com.labresource.backend.maintenance.entity.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {
    List<MaintenanceLog> findByMaintenanceId(Long maintenanceId);
}
