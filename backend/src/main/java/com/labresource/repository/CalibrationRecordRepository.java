package com.labresource.repository;

import com.labresource.entity.CalibrationRecord;
import com.labresource.entity.Equipment;
import com.labresource.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CalibrationRecordRepository
        extends JpaRepository<CalibrationRecord, String> {

    List<CalibrationRecord> findByEquipment(
            Equipment equipment
    );

    List<CalibrationRecord> findByTechnician(
            User technician
    );

    List<CalibrationRecord> findByStatus(
            String status
    );

    List<CalibrationRecord> findByCalibrationResult(
            String calibrationResult
    );

    List<CalibrationRecord> findByCalibrationDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    List<CalibrationRecord> findByNextCalibrationDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    List<CalibrationRecord>
    findByTechnician_FirstNameContainingIgnoreCase(
            String technicianName
    );
}