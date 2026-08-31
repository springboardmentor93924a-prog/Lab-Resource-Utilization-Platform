package com.infosys.labresource.Equipment.Repository;

import com.infosys.labresource.Equipment.entity.CalibrationRecord;
import com.infosys.labresource.Equipment.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CalibrationRecordRepository extends JpaRepository<CalibrationRecord,Long> {
    Optional<CalibrationRecord> findByEquipment(Equipment equipment);

    boolean existsByEquipment(Equipment equipment);
    List<CalibrationRecord> findByNextCalibrationDateBetween(LocalDate start, LocalDate end);
    List<CalibrationRecord> findByCertificationExpiryDateBetween(LocalDate start, LocalDate end);
}
