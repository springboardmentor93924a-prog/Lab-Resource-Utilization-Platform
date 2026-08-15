package com.labresource.backend.calibration.repository;

import com.labresource.backend.calibration.entity.EquipmentCalibration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EquipmentCalibrationRepository extends JpaRepository<EquipmentCalibration, Long> {
    List<EquipmentCalibration> findByEquipmentIdOrderByNextDueDateDesc(Long equipmentId);

    Optional<EquipmentCalibration> findFirstByEquipmentIdAndNextDueDateGreaterThanEqualOrderByNextDueDateDesc(
            Long equipmentId, LocalDate today);
}
