package com.labresource.backend.scheduler;

import com.labresource.backend.calibration.entity.EquipmentCalibration;
import com.labresource.backend.calibration.repository.EquipmentCalibrationRepository;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Checks calibration due dates daily and sends notifications only at milestone
 * intervals: 30, 15, 7, 1 day(s) before nextDueDate, on the due date, and
 * exactly ONCE 1 day after (CALIBRATION_OVERDUE) — duplicate-protected.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CalibrationReminderJob {

    private static final int[] REMINDER_DAYS = {30, 15, 7, 1};

    private final EquipmentRepository equipmentRepository;
    private final EquipmentCalibrationRepository calibrationRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 6 * * *") // run daily at 6:00 AM
    public void checkCalibrations() {
        log.info("Running CalibrationReminderJob...");
        LocalDate today = LocalDate.now();

        List<Equipment> equipmentList = equipmentRepository.findAll();

        for (Equipment e : equipmentList) {
            Optional<EquipmentCalibration> latestOpt =
                    calibrationRepository.findByEquipmentIdOrderByNextDueDateDesc(e.getEquipmentId())
                            .stream().findFirst();

            if (latestOpt.isEmpty()) continue;

            EquipmentCalibration cal = latestOpt.get();
            LocalDate dueDate = cal.getNextDueDate();
            long daysRemaining = today.until(dueDate).getDays();

            if (daysRemaining < -1) {
                // Already past the 1-day overdue window — skip to avoid repeated notifications
                continue;
            }

            if (daysRemaining == -1) {
                // Exactly 1 day past due — send CALIBRATION_OVERDUE once
                String dedupKey = "CAL-" + cal.getCalibrationId() + "-OVERDUE";
                sendIfAbsent(e, "CALIBRATION_OVERDUE", dedupKey,
                        "Calibration Overdue: " + e.getName(),
                        "Calibration for \"" + e.getName() + "\" was due on " + dueDate + " and is now overdue.");

            } else if (daysRemaining == 0) {
                // Due today — CALIBRATION_DUE on the due date
                String dedupKey = "CAL-" + cal.getCalibrationId() + "-DUE0";
                sendIfAbsent(e, "CALIBRATION_DUE", dedupKey,
                        "Calibration Due Today: " + e.getName(),
                        "Calibration for \"" + e.getName() + "\" is due today (" + dueDate + "). Please schedule immediately.");

            } else {
                // Check if today is exactly one of the milestone days
                for (int days : REMINDER_DAYS) {
                    if (daysRemaining == days) {
                        String dedupKey = "CAL-" + cal.getCalibrationId() + "-" + days + "D";
                        sendIfAbsent(e, "CALIBRATION_DUE", dedupKey,
                                "Calibration Due in " + days + " Day(s): " + e.getName(),
                                "Calibration for \"" + e.getName() + "\" is due on " + dueDate + " (" + days + " day(s) remaining).");
                        break;
                    }
                }
            }
        }
    }

    /** Send notification to both Lab Managers and Department Heads, but only if not already sent. */
    private void sendIfAbsent(Equipment equipment, String type, String dedupKey, String title, String message) {
        Long deptId = equipment.getDepartmentId();

        // notify all managers in the department
        notificationService.notifyDepartmentLabManagers(deptId, type, dedupKey, message);

        // notify all department heads
        notificationService.notifyDepartmentHeads(deptId, type, dedupKey, message);

        log.info("CalibrationReminderJob: sent [{}] for equipment ID {}", type, equipment.getEquipmentId());
    }
}
