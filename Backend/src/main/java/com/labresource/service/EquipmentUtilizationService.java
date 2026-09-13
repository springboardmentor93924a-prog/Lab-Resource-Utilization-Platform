package com.labresource.service;

import com.labresource.entity.Equipment;
import com.labresource.entity.EquipmentUtilization;
import com.labresource.entity.UtilizationStatus;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.EquipmentUtilizationRepository;
import com.labresource.dto.UtilizationAnalyticsDTO;
import com.labresource.dto.UtilizationHeatmapDTO;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;

@Service
public class EquipmentUtilizationService {

    private final EquipmentUtilizationRepository utilizationRepository;
    private final EquipmentRepository equipmentRepository;

    public EquipmentUtilizationService(
            EquipmentUtilizationRepository utilizationRepository,
            EquipmentRepository equipmentRepository
    ) {
        this.utilizationRepository = utilizationRepository;
        this.equipmentRepository = equipmentRepository;
    }

    // =========================================================
    // START EQUIPMENT USAGE
    // =========================================================

    public EquipmentUtilization startUsage(
            Long equipmentId
    ) {

        Equipment equipment =
                equipmentRepository.findById(equipmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Equipment not found"
                                )
                        );

        // -----------------------------------------------------
        // CHECK WHETHER EQUIPMENT IS ALREADY IN USE
        // -----------------------------------------------------

        boolean alreadyInUse =
                utilizationRepository
                        .existsByEquipmentIdAndStatus(
                                equipmentId,
                                UtilizationStatus.IN_USE
                        );

        if (alreadyInUse) {

            throw new RuntimeException(
                    "Equipment is already in use"
            );
        }

        // -----------------------------------------------------
        // CREATE UTILIZATION SESSION
        // -----------------------------------------------------

        LocalDateTime now =
                LocalDateTime.now();

        EquipmentUtilization utilization =
                new EquipmentUtilization();

        utilization.setEquipment(equipment);

        utilization.setUsageDate(
                now.toLocalDate()
        );

        utilization.setStartTime(
                now.toLocalTime()
        );

        utilization.setStartedAt(now);

        utilization.setStatus(
                UtilizationStatus.IN_USE
        );

        utilization.setUsageHours(0.0);

        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        return utilizationRepository.save(
                utilization
        );
    }

    // =========================================================
    // STOP EQUIPMENT USAGE
    // =========================================================

    public EquipmentUtilization stopUsage(
            Long utilizationId
    ) {

        EquipmentUtilization utilization =
                utilizationRepository.findById(
                        utilizationId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Utilization record not found"
                        )
                );

        // -----------------------------------------------------
        // CHECK STATUS
        // -----------------------------------------------------

        if (utilization.getStatus()
                != UtilizationStatus.IN_USE) {

            throw new RuntimeException(
                    "Equipment usage is not currently active"
            );
        }

        // -----------------------------------------------------
        // END SESSION
        // -----------------------------------------------------

        LocalDateTime end =
                LocalDateTime.now();

        utilization.setEndedAt(end);

        utilization.setEndTime(
                end.toLocalTime()
        );

        // -----------------------------------------------------
        // CALCULATE USAGE HOURS
        // -----------------------------------------------------

        LocalDateTime start =
                utilization.getStartedAt();

        long seconds =
                Duration.between(
                        start,
                        end
                ).getSeconds();

        double hours =
                seconds / 3600.0;

        utilization.setUsageHours(
                Math.round(hours * 100.0) / 100.0
        );

        utilization.setStatus(
                UtilizationStatus.COMPLETED
        );

        return utilizationRepository.save(
                utilization
        );
    }

    // =========================================================
    // GET UTILIZATION BY ID
    // =========================================================

    public EquipmentUtilization getUtilization(
            Long id
    ) {

        return utilizationRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Utilization record not found"
                        )
                );
    }

    // =========================================================
    // GET ALL UTILIZATION
    // =========================================================

    public List<EquipmentUtilization>
    getAllUtilization() {

        return utilizationRepository.findAll();
    }

    // =========================================================
    // GET EQUIPMENT UTILIZATION
    // =========================================================

    public List<EquipmentUtilization>
    getEquipmentUtilization(
            Long equipmentId
    ) {

        return utilizationRepository
                .findByEquipmentId(equipmentId);
    }

    // =========================================================
    // GET UTILIZATION FOR DATE
    // =========================================================

    public List<EquipmentUtilization>
    getUtilizationByDate(
            LocalDate date
    ) {

        return utilizationRepository
                .findByUsageDate(date);
    }

    // =========================================================
    // GET UTILIZATION BY DATE RANGE
    // =========================================================

    public List<EquipmentUtilization>
    getUtilizationBetweenDates(
            LocalDate startDate,
            LocalDate endDate
    ) {

        return utilizationRepository
                .findByUsageDateBetween(
                        startDate,
                        endDate
                );
    }

    // =========================================================
    // GET EQUIPMENT UTILIZATION BY DATE RANGE
    // =========================================================

    public List<EquipmentUtilization>
    getEquipmentUtilizationBetweenDates(
            Long equipmentId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        return utilizationRepository
                .findByEquipmentIdAndUsageDateBetween(
                        equipmentId,
                        startDate,
                        endDate
                );
    }

    // =========================================================
    // GET CURRENT ACTIVE UTILIZATION
    // =========================================================

    public EquipmentUtilization
    getActiveUtilization(
            Long equipmentId
    ) {

        return utilizationRepository
                .findFirstByEquipmentIdAndStatus(
                        equipmentId,
                        UtilizationStatus.IN_USE
                )
                .orElse(null);
    }

    // =========================================================
    // GET ALL CURRENTLY ACTIVE EQUIPMENT
    // =========================================================

    public List<EquipmentUtilization>
    getCurrentlyActiveUtilization() {

        return utilizationRepository
                .findByStatusOrderByStartedAtDesc(
                        UtilizationStatus.IN_USE
                );
    }

    // =========================================================
    // CHECK EQUIPMENT STATUS
    // =========================================================

    public String getEquipmentUtilizationStatus(
            Long equipmentId
    ) {

        boolean active =
                utilizationRepository
                        .existsByEquipmentIdAndStatus(
                                equipmentId,
                                UtilizationStatus.IN_USE
                        );

        if (active) {
            return "IN_USE";
        }

        return "AVAILABLE";
    }

    // =========================================================
    // CALCULATE CURRENT USAGE HOURS
    // =========================================================

    public double getCurrentUsageHours(
            Long utilizationId
    ) {

        EquipmentUtilization utilization =
                utilizationRepository
                        .findById(utilizationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Utilization record not found"
                                )
                        );

        if (utilization.getStartedAt() == null) {
            return 0.0;
        }

        LocalDateTime end =
                utilization.getEndedAt();

        if (end == null) {
            end = LocalDateTime.now();
        }

        long seconds =
                Duration.between(
                        utilization.getStartedAt(),
                        end
                ).getSeconds();

        double hours =
                seconds / 3600.0;

        return Math.round(hours * 100.0) / 100.0;
    }

    // =========================================================
    // DELETE UTILIZATION RECORD
    // =========================================================

    public void deleteUtilization(
            Long id
    ) {

        if (!utilizationRepository.existsById(id)) {

            throw new RuntimeException(
                    "Utilization record not found"
            );
        }

        utilizationRepository.deleteById(id);
    }

    // =========================================================
// UTILIZATION ANALYTICS
// =========================================================

public List<UtilizationAnalyticsDTO>
getUtilizationAnalytics() {

    List<EquipmentUtilization> records =
            utilizationRepository.findAll();

    List<UtilizationAnalyticsDTO> analytics =
            new ArrayList<>();

    List<Equipment> equipmentList =
            equipmentRepository.findAll();

    for (Equipment equipment : equipmentList) {

        Long equipmentId =
                equipment.getId();

        String equipmentName =
                equipment.getName();

        List<EquipmentUtilization> equipmentRecords =
                records.stream()
                        .filter(record ->
                                record.getEquipment() != null
                                &&
                                record.getEquipment()
                                        .getId()
                                        .equals(equipmentId)
                        )
                        .toList();

        double usageHours =
                equipmentRecords.stream()
                        .mapToDouble(record ->
                                record.getUsageHours() != null
                                        ? record.getUsageHours()
                                        : 0.0
                        )
                        .sum();

        // -------------------------------------------------
        // CURRENT DAY ANALYSIS
        // -------------------------------------------------

        double availableHours = 24.0;

        double utilizationPercentage =
                (usageHours / availableHours) * 100.0;

        // Prevent values above 100
        if (utilizationPercentage > 100) {
            utilizationPercentage = 100;
        }

        utilizationPercentage =
                Math.round(
                        utilizationPercentage * 100.0
                ) / 100.0;

        double idleHours =
                Math.max(
                        0,
                        availableHours - usageHours
                );

        idleHours =
                Math.round(
                        idleHours * 100.0
                ) / 100.0;

        // -------------------------------------------------
        // UTILIZATION LEVEL
        // -------------------------------------------------

        String utilizationLevel;

        if (utilizationPercentage >= 70) {

            utilizationLevel = "HIGH";

        } else if (utilizationPercentage >= 30) {

            utilizationLevel = "MEDIUM";

        } else {

            utilizationLevel = "LOW";
        }

        // -------------------------------------------------
        // LAST USED
        // -------------------------------------------------

        String lastUsedAt = null;

        EquipmentUtilization lastRecord =
                equipmentRecords.stream()
                        .filter(record ->
                                record.getStartedAt() != null
                        )
                        .max(
                                Comparator.comparing(
                                        EquipmentUtilization::getStartedAt
                                )
                        )
                        .orElse(null);

        if (lastRecord != null) {

            LocalDateTime lastTime =
                    lastRecord.getStartedAt();

            lastUsedAt =
                    lastTime.toString();
        }

        // -------------------------------------------------
        // DTO
        // -------------------------------------------------

        analytics.add(
                new UtilizationAnalyticsDTO(
                        equipmentId,
                        equipmentName,
                        Math.round(
                                usageHours * 100.0
                        ) / 100.0,
                        utilizationPercentage,
                        idleHours,
                        utilizationLevel,
                        lastUsedAt
                )
        );
    }

    return analytics;
}

// =========================================================
// UTILIZATION ANALYTICS FOR ONE EQUIPMENT
// =========================================================

public UtilizationAnalyticsDTO
getEquipmentUtilizationAnalytics(
        Long equipmentId
) {

    Equipment equipment =
            equipmentRepository.findById(equipmentId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Equipment not found"
                            )
                    );

    List<EquipmentUtilization> records =
            utilizationRepository
                    .findByEquipmentId(equipmentId);

    double usageHours =
            records.stream()
                    .mapToDouble(record ->
                            record.getUsageHours() != null
                                    ? record.getUsageHours()
                                    : 0.0
                    )
                    .sum();

    double availableHours = 24.0;

    double utilizationPercentage =
            (usageHours / availableHours) * 100.0;

    if (utilizationPercentage > 100) {
        utilizationPercentage = 100;
    }

    utilizationPercentage =
            Math.round(
                    utilizationPercentage * 100.0
            ) / 100.0;

    double idleHours =
            Math.max(
                    0,
                    availableHours - usageHours
            );

    idleHours =
            Math.round(
                    idleHours * 100.0
            ) / 100.0;

    String utilizationLevel;

    if (utilizationPercentage >= 70) {

        utilizationLevel = "HIGH";

    } else if (utilizationPercentage >= 30) {

        utilizationLevel = "MEDIUM";

    } else {

        utilizationLevel = "LOW";
    }

    String lastUsedAt = null;

    EquipmentUtilization lastRecord =
            records.stream()
                    .filter(record ->
                            record.getStartedAt() != null
                    )
                    .max(
                            Comparator.comparing(
                                    EquipmentUtilization::getStartedAt
                            )
                    )
                    .orElse(null);

    if (lastRecord != null) {

        lastUsedAt =
                lastRecord
                        .getStartedAt()
                        .toString();
    }

    return new UtilizationAnalyticsDTO(
            equipment.getId(),
            equipment.getName(),
            Math.round(
                    usageHours * 100.0
            ) / 100.0,
            utilizationPercentage,
            idleHours,
            utilizationLevel,
            lastUsedAt
    );
}


// =========================================================
// HEATMAP DATA
// =========================================================

public List<UtilizationHeatmapDTO> getHeatmapData(
        LocalDate startDate,
        LocalDate endDate
) {

    List<EquipmentUtilization> records =
            utilizationRepository.findByUsageDateBetween(
                    startDate,
                    endDate
            );

    List<UtilizationHeatmapDTO> result =
            new ArrayList<>();

    // Maximum expected usage per day = 24 hours
    double totalAvailableHours = 24.0;

    for (EquipmentUtilization record : records) {

        double usageHours =
                record.getUsageHours() != null
                        ? record.getUsageHours()
                        : 0.0;

        // If record is still IN_USE,
        // calculate usage until now.
        if (record.getStatus() == UtilizationStatus.IN_USE) {

            usageHours =
                    getCurrentUsageHours(
                            record.getId()
                    );
        }

        double utilizationPercentage =
                (usageHours / totalAvailableHours) * 100.0;

        // Prevent percentage above 100
        if (utilizationPercentage > 100) {
            utilizationPercentage = 100;
        }

        utilizationPercentage =
                Math.round(
                        utilizationPercentage * 100.0
                ) / 100.0;

        String equipmentName =
                record.getEquipment() != null
                        ? record.getEquipment().getName()
                        : "Unknown Equipment";

        result.add(
                new UtilizationHeatmapDTO(
                        record.getEquipment().getId(),
                        equipmentName,
                        record.getUsageDate(),
                        usageHours,
                        utilizationPercentage
                )
        );
    }

    return result;
}


// =========================================================
// 5.13.4
// IDLE EQUIPMENT DETECTION
// =========================================================

public List<UtilizationAnalyticsDTO> getIdleEquipment() {

    List<UtilizationAnalyticsDTO> allAnalytics =
            getUtilizationAnalytics();

    // Idle threshold = 24 hours
    double idleThresholdHours = 24.0;

    return allAnalytics.stream()
            .filter(item ->
                    item.getIdleHours() >= idleThresholdHours
            )
            .toList();
}


}