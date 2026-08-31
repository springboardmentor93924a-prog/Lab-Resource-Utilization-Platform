package com.infosys.labresource.notification;

import com.infosys.labresource.Equipment.Repository.CalibrationRecordRepository;
import com.infosys.labresource.Equipment.entity.CalibrationRecord;
import com.infosys.labresource.maintainance.Entities.MaintenanceSchedule;
import com.infosys.labresource.maintainance.Repository.MaintenanceScheduledRepo;
import com.infosys.labresource.notification.entity.NotificationType;
import com.infosys.labresource.notification.service.NotificationService;
import com.infosys.labresource.user.Repository.UserRepository;
import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Role;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final CalibrationRecordRepository calibRepo;
    private final MaintenanceScheduledRepo scheduleRepo;
    private final UserRepository userRepo;
    private final NotificationService notifService;

    private static final int REMINDER_WINDOW_DAYS = 7;

    @Scheduled(cron = "0 0 8 * * *")
    public void runChecks() {
        checkCalibrationDue();
        checkMaintenanceDue();
    }

    private void checkCalibrationDue() {

        LocalDate today = LocalDate.now();
        LocalDate windowEnd = today.plusDays(REMINDER_WINDOW_DAYS);

        List<CalibrationRecord> dueSoon = calibRepo.findByNextCalibrationDateBetween(today, windowEnd);

        for (CalibrationRecord record : dueSoon) {

            String msg = "Calibration for " + record.getEquipment().getEquipName() +
                    " is due on " + record.getNextCalibrationDate() + ".";

            notifyDepartment(record.getEquipment().getDepartment(), msg, NotificationType.CALIBRATION);
        }

        List<CalibrationRecord> certExpiring = calibRepo.findByCertificationExpiryDateBetween(today, windowEnd);

        for (CalibrationRecord record : certExpiring) {

            String msg = "Certification for " + record.getEquipment().getEquipName() +
                    " expires on " + record.getCertificationExpiryDate() + ".";

            notifyDepartment(record.getEquipment().getDepartment(), msg, NotificationType.CALIBRATION);
        }
    }

    private void checkMaintenanceDue() {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowEnd = now.plusDays(REMINDER_WINDOW_DAYS);

        List<MaintenanceSchedule> upcoming = scheduleRepo.findByScheduledStartBetween(now, windowEnd);

        for (MaintenanceSchedule schedule : upcoming) {

            String msg = "Maintenance for " + schedule.getEquipment().getEquipName() +
                    " is scheduled on " + schedule.getScheduledStart() + ".";

            notifyDepartment(schedule.getEquipment().getDepartment(), msg, NotificationType.MAINTENANCE);
        }
    }

    private void notifyDepartment(Department dept, String message, NotificationType type) {

        if (dept == null) {
            return;
        }

        List<UserEntity> managers = userRepo.findByDepartmentAndRole(dept, Role.LAB_MANAGER);

        for (UserEntity manager : managers) {
            notifService.send(manager, message, type);
        }
    }
}