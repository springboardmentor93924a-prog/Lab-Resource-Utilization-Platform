package com.labresource.backend.maintenance.repository;

import com.labresource.backend.maintenance.entity.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {
    List<MaintenanceRecord> findByEquipmentIdOrderByCreatedAtDesc(Long equipmentId);
    List<MaintenanceRecord> findByTechnicianIdOrderByCreatedAtDesc(Long technicianId);
    List<MaintenanceRecord> findByStatus(String status);
    Optional<MaintenanceRecord> findByIssueReportId(Long issueReportId);
}
