package com.labresource.repository;

import com.labresource.entity.EquipmentUtilization;
import com.labresource.entity.UtilizationStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EquipmentUtilizationRepository
        extends JpaRepository<EquipmentUtilization, Long> {

    // =========================================================
    // FIND BY EQUIPMENT
    // =========================================================

    List<EquipmentUtilization> findByEquipmentId(
            Long equipmentId
    );

    // =========================================================
    // FIND BY DATE
    // =========================================================

    List<EquipmentUtilization> findByUsageDate(
            LocalDate usageDate
    );

    // =========================================================
    // FIND BY EQUIPMENT AND DATE
    // =========================================================

    List<EquipmentUtilization>
    findByEquipmentIdAndUsageDate(
            Long equipmentId,
            LocalDate usageDate
    );

    // =========================================================
    // FIND BY STATUS
    // =========================================================

    List<EquipmentUtilization> findByStatus(
            UtilizationStatus status
    );

    // =========================================================
    // FIND ACTIVE USAGE
    // =========================================================

    Optional<EquipmentUtilization>
    findFirstByEquipmentIdAndStatus(
            Long equipmentId,
            UtilizationStatus status
    );

    // =========================================================
    // FIND ACTIVE USAGE FOR ALL EQUIPMENT
    // =========================================================

    List<EquipmentUtilization>
    findByStatusOrderByStartedAtDesc(
            UtilizationStatus status
    );

    // =========================================================
    // FIND DATE RANGE
    // =========================================================

    List<EquipmentUtilization>
    findByUsageDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    // =========================================================
    // FIND EQUIPMENT DATE RANGE
    // =========================================================

    List<EquipmentUtilization>
    findByEquipmentIdAndUsageDateBetween(
            Long equipmentId,
            LocalDate startDate,
            LocalDate endDate
    );

    // =========================================================
    // CHECK ACTIVE SESSION
    // =========================================================

    boolean existsByEquipmentIdAndStatus(
            Long equipmentId,
            UtilizationStatus status
    );
}