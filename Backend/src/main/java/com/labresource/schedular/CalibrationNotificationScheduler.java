package com.labresource.scheduler;

import com.labresource.entity.Calibration;
import com.labresource.entity.NotificationType;
import com.labresource.entity.Role;
import com.labresource.entity.User;
import com.labresource.repository.CalibrationRepository;
import com.labresource.repository.UserRepository;
import com.labresource.service.NotificationService;
import com.labresource.repository.NotificationRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class CalibrationNotificationScheduler {

    private static final long REMINDER_DAYS = 30;

    private final CalibrationRepository calibrationRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    public CalibrationNotificationScheduler(
            CalibrationRepository calibrationRepository,
            UserRepository userRepository,
            NotificationRepository notificationRepository,
            NotificationService notificationService) {

        this.calibrationRepository =
                calibrationRepository;

        this.userRepository =
                userRepository;

        this.notificationRepository =
                notificationRepository;

        this.notificationService =
                notificationService;
    }

    /*
     * Runs every day at 9:00 AM.
     *
     * cron format:
     * second minute hour day-of-month month day-of-week
     */
    @Scheduled(
            cron = "0 0 9 * * *"
    )
    @Transactional
    public void checkCalibrationNotifications() {

        LocalDate today =
                LocalDate.now();

        LocalDate reminderDate =
                today.plusDays(
                        REMINDER_DAYS
                );

        checkExpiredCalibrations(
                today
        );

        checkUpcomingCalibrations(
                today,
                reminderDate
        );

        checkExpiringCertifications(
                today,
                reminderDate
        );
    }

    // =====================================================
    // CALIBRATION EXPIRED
    // =====================================================

    private void checkExpiredCalibrations(
            LocalDate today) {

        List<Calibration> expiredCalibrations =
                calibrationRepository
                        .findByNextCalibrationDateLessThanEqual(
                                today
                        );

        for (Calibration calibration :
                expiredCalibrations) {

            notifyUsers(
                    NotificationType.CALIBRATION_EXPIRED,
                    "Calibration Overdue",
                    "Calibration is overdue for equipment: "
                            + getEquipmentName(
                                    calibration
                            ),
                    calibration
            );
        }
    }

    // =====================================================
    // CALIBRATION DUE SOON
    // =====================================================

    private void checkUpcomingCalibrations(
            LocalDate today,
            LocalDate reminderDate) {

        List<Calibration> upcomingCalibrations =
                calibrationRepository
                        .findByNextCalibrationDateBetween(
                                today,
                                reminderDate
                        );

        for (Calibration calibration :
                upcomingCalibrations) {

            /*
             * Skip today's date because it is already
             * handled by the overdue notification.
             */
            if (calibration
                    .getNextCalibrationDate()
                    .isAfter(today)) {

                notifyUsers(
                        NotificationType.CALIBRATION_DUE,
                        "Calibration Due Soon",
                        "Calibration is due on "
                                + calibration
                                .getNextCalibrationDate()
                                + " for equipment: "
                                + getEquipmentName(
                                        calibration
                                ),
                        calibration
                );
            }
        }
    }

    // =====================================================
    // CERTIFICATION EXPIRING
    // =====================================================

    private void checkExpiringCertifications(
            LocalDate today,
            LocalDate reminderDate) {

        List<Calibration> expiringCertifications =
                calibrationRepository
                        .findByCertificationExpiryDateBetween(
                                today,
                                reminderDate
                        );

        for (Calibration calibration :
                expiringCertifications) {

            if (calibration
                    .getCertificationExpiryDate()
                    .isAfter(today)) {

                notifyUsers(
                        NotificationType.CERTIFICATION_EXPIRING,
                        "Certification Expiring Soon",
                        "Certification expires on "
                                + calibration
                                .getCertificationExpiryDate()
                                + " for equipment: "
                                + getEquipmentName(
                                        calibration
                                ),
                        calibration
                );
            }
        }
    }

    // =====================================================
    // NOTIFY RELEVANT USERS
    // =====================================================

    private void notifyUsers(
        NotificationType notificationType,
        String title,
        String message,
        Calibration calibration) {

    for (User user :
            getNotificationUsers()) {

        boolean notificationExists =
                notificationRepository
                        .existsByUserAndTypeAndReferenceIdAndReferenceType(
                                user,
                                notificationType,
                                calibration.getId(),
                                "CALIBRATION"
                        );

        if (!notificationExists) {

            notificationService
                    .createNotification(
                            user,
                            notificationType,
                            title,
                            message,
                            calibration.getId(),
                            "CALIBRATION"
                    );
        }
    }
}

    // =====================================================
    // GET NOTIFICATION USERS
    // =====================================================

    private List<User> getNotificationUsers() {

        Set<User> uniqueUsers =
                new HashSet<>();

        uniqueUsers.addAll(
                userRepository.findByRole(
                        Role.LAB_TECHNICIAN
                )
        );

        uniqueUsers.addAll(
                userRepository.findByRole(
                        Role.LAB_MANAGER
                )
        );

        uniqueUsers.addAll(
                userRepository.findByRole(
                        Role.INSTITUTION_ADMIN
                )
        );

        return new ArrayList<>(
                uniqueUsers
        );
    }

    // =====================================================
    // EQUIPMENT NAME
    // =====================================================

    private String getEquipmentName(
            Calibration calibration) {

        if (calibration == null ||
                calibration.getEquipment() == null) {

            return "Unknown Equipment";
        }

        if (calibration
                .getEquipment()
                .getName() != null &&
                !calibration
                        .getEquipment()
                        .getName()
                        .trim()
                        .isEmpty()) {

            return calibration
                    .getEquipment()
                    .getName();
        }

        return "Equipment ID "
                + calibration
                        .getEquipment()
                        .getId();
    }
}