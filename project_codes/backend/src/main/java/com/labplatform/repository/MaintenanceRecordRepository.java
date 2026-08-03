package com.labplatform.repository;

import com.labplatform.entity.MaintenanceRecord;
import com.labplatform.entity.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {
    List<MaintenanceRecord> findByEquipmentId(Long equipmentId);
    List<MaintenanceRecord> findByStatus(MaintenanceStatus status);
    List<MaintenanceRecord> findByAssignedTechnicianId(Long technicianId);
}
