package com.labresource.repository;

import com.labresource.entity.Equipment;
import com.labresource.entity.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MaintenanceRecordRepository
        extends JpaRepository<MaintenanceRecord, String> {

    List<MaintenanceRecord> findByEquipment(
            Equipment equipment
    );

    List<MaintenanceRecord> findByStatus(
            String status
    );

    List<MaintenanceRecord> findByMaintenanceType(
            String maintenanceType
    );

    List<MaintenanceRecord> findByScheduledDateBetween(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    List<MaintenanceRecord> findByCompletionDateBetween(
            LocalDateTime startDate,
            LocalDateTime endDate
    );


    List<MaintenanceRecord>
    findByTechnician_FirstNameContainingIgnoreCase(
            String technicianName
    );
}


//Controller
//      │
//      ▼
//Service
//      │
//      ▼
//MaintenanceRecordRepository
//      │
//      ▼
//Database