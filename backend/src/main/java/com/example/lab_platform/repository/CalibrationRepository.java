package com.example.lab_platform.repository;

import com.example.lab_platform.entity.EquipmentCalibration;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CalibrationRepository
        extends JpaRepository<EquipmentCalibration, Integer> {

    List<EquipmentCalibration> findByEquipment_EquipmentId(Integer equipmentId);

    List<EquipmentCalibration> findByCalibrationStatus(String calibrationStatus);

    // Overdue: next calibration date has already passed
    List<EquipmentCalibration> findByNextCalibrationDateLessThanEqual(LocalDate date);

    // Due soon: next calibration date falls within the given window
    List<EquipmentCalibration> findByNextCalibrationDateBetween(LocalDate start, LocalDate end);

    // Most recent record for an equipment — used to show its current status
    Optional<EquipmentCalibration> findTopByEquipment_EquipmentIdOrderByCalibrationDateDesc(
            Integer equipmentId
    );
}