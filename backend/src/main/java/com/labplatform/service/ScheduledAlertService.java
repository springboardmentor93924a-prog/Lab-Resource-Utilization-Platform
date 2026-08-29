package com.labplatform.service;

import com.labplatform.entity.Equipment;
import com.labplatform.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@EnableScheduling
@RequiredArgsConstructor
public class ScheduledAlertService {

    private final EquipmentRepository equipmentRepository;

    // Checks every morning at 8:00 AM (or every 60s in test mode) for calibration due dates
    @Scheduled(fixedRate = 60000)
    public void checkUpcomingCalibrationAndMaintenance() {
        LocalDateTime warningThreshold = LocalDateTime.now().plusDays(15);
        List<Equipment> allEquipment = equipmentRepository.findAll();

        for (Equipment eq : allEquipment) {
            if (eq.getNextCalibrationDueDate() != null && eq.getNextCalibrationDueDate().isBefore(warningThreshold)) {
                log.warn("[ALERT - CALIBRATION DUE]: Equipment '{}' (ID: {}) calibration expires on {}! Schedule service.",
                        eq.getName(), eq.getId(), eq.getNextCalibrationDueDate());
            }
        }
    }
}