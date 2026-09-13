package com.labresource.service.impl;

import com.labresource.entity.Calibration;
import com.labresource.entity.Equipment;
import com.labresource.entity.NotificationType;
import com.labresource.entity.Role;
import com.labresource.entity.User;
import com.labresource.repository.CalibrationRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.UserRepository;
import com.labresource.service.CalibrationService;
import com.labresource.service.NotificationService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class CalibrationServiceImpl
        implements CalibrationService {

    private final CalibrationRepository calibrationRepository;
    private final EquipmentRepository equipmentRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // Reminder window
    private static final long REMINDER_DAYS = 30;

    public CalibrationServiceImpl(
            CalibrationRepository calibrationRepository,
            EquipmentRepository equipmentRepository,
            NotificationService notificationService,
            UserRepository userRepository) {

        this.calibrationRepository =
                calibrationRepository;

        this.equipmentRepository =
                equipmentRepository;

        this.notificationService =
                notificationService;

        this.userRepository =
                userRepository;
    }

    // =========================================================
    // 1. CREATE CALIBRATION
    // =========================================================

    @Override
    public Calibration createCalibration(
            Calibration calibration) {

        if (calibration == null) {
            throw new RuntimeException(
                    "Calibration data cannot be null"
            );
        }

        if (calibration.getEquipment() == null ||
                calibration.getEquipment().getId() == null) {

            throw new RuntimeException(
                    "Equipment is required"
            );
        }

        Long equipmentId =
                calibration.getEquipment().getId();

        Equipment equipment =
                equipmentRepository.findById(equipmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Equipment not found with ID: "
                                                + equipmentId
                                )
                        );

        // Use managed Equipment entity
        calibration.setEquipment(equipment);

        validateDates(calibration);

        Calibration savedCalibration =
                calibrationRepository.save(calibration);

        // =====================================================
        // TASK 6.2.3
        // CALIBRATION CREATED / SCHEDULED NOTIFICATION
        // =====================================================

        notifyCalibrationCreated(
                savedCalibration
        );

        return savedCalibration;
    }

    // =========================================================
    // 2. GET ALL CALIBRATIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Calibration> getAllCalibrations() {

        return calibrationRepository.findAll();
    }

    // =========================================================
    // 3. GET CALIBRATION BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public Calibration getCalibrationById(
            Long id) {

        return calibrationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Calibration record not found with ID: "
                                        + id
                        )
                );
    }

    // =========================================================
    // 4. GET CALIBRATION HISTORY BY EQUIPMENT
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Calibration> getCalibrationsByEquipment(
            Long equipmentId) {

        if (equipmentId == null) {
            throw new RuntimeException(
                    "Equipment ID is required"
            );
        }

        if (!equipmentRepository.existsById(
                equipmentId)) {

            throw new RuntimeException(
                    "Equipment not found with ID: "
                            + equipmentId
            );
        }

        return calibrationRepository
                .findByEquipmentId(
                        equipmentId
                );
    }

    // =========================================================
    // 5. UPDATE CALIBRATION
    // =========================================================

    @Override
    public Calibration updateCalibration(
            Long id,
            Calibration updatedCalibration) {

        Calibration existing =
                calibrationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Calibration record not found with ID: "
                                                + id
                                )
                        );

        if (updatedCalibration == null) {
            throw new RuntimeException(
                    "Calibration data cannot be null"
            );
        }

        // -----------------------------------------------------
        // Equipment
        // -----------------------------------------------------

        if (updatedCalibration.getEquipment() != null &&
                updatedCalibration
                        .getEquipment()
                        .getId() != null) {

            Long equipmentId =
                    updatedCalibration
                            .getEquipment()
                            .getId();

            Equipment equipment =
                    equipmentRepository
                            .findById(equipmentId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Equipment not found with ID: "
                                                    + equipmentId
                                    )
                            );

            existing.setEquipment(
                    equipment
            );
        }

        // -----------------------------------------------------
        // Calibration information
        // -----------------------------------------------------

        existing.setLastCalibrationDate(
                updatedCalibration
                        .getLastCalibrationDate()
        );

        existing.setNextCalibrationDate(
                updatedCalibration
                        .getNextCalibrationDate()
        );

        // -----------------------------------------------------
        // Certification information
        // -----------------------------------------------------

        existing.setCertificateNumber(
                updatedCalibration
                        .getCertificateNumber()
        );

        existing.setCertificationDetails(
                updatedCalibration
                        .getCertificationDetails()
        );

        existing.setCertificationExpiryDate(
                updatedCalibration
                        .getCertificationExpiryDate()
        );

        // -----------------------------------------------------
        // Additional information
        // -----------------------------------------------------

        existing.setPerformedBy(
                updatedCalibration
                        .getPerformedBy()
        );

        existing.setRemarks(
                updatedCalibration
                        .getRemarks()
        );

        validateDates(existing);

        Calibration savedCalibration =
                calibrationRepository.save(
                        existing
                );

        // =====================================================
        // TASK 6.2.3
        // CALIBRATION UPDATED / COMPLETED NOTIFICATION
        // =====================================================

        notifyCalibrationUpdated(
                savedCalibration
        );

        return savedCalibration;
    }

    // =========================================================
    // 6. DELETE CALIBRATION
    // =========================================================

    @Override
    public void deleteCalibration(
            Long id) {

        if (!calibrationRepository
                .existsById(id)) {

            throw new RuntimeException(
                    "Calibration record not found with ID: "
                            + id
            );
        }

        calibrationRepository
                .deleteById(id);
    }

    // =========================================================
    // 7. UPCOMING CALIBRATIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Calibration> getUpcomingCalibrations(
            LocalDate startDate,
            LocalDate endDate) {

        validateDateRange(
                startDate,
                endDate
        );

        return calibrationRepository
                .findByNextCalibrationDateBetween(
                        startDate,
                        endDate
                );
    }

    // =========================================================
    // 8. EXPIRED CALIBRATIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Calibration> getExpiredCalibrations(
            LocalDate date) {

        if (date == null) {
            date = LocalDate.now();
        }

        return calibrationRepository
                .findByNextCalibrationDateLessThanEqual(
                        date
                );
    }

    // =========================================================
    // 9. UPCOMING CERTIFICATIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Calibration> getUpcomingCertifications(
            LocalDate startDate,
            LocalDate endDate) {

        validateDateRange(
                startDate,
                endDate
        );

        return calibrationRepository
                .findByCertificationExpiryDateBetween(
                        startDate,
                        endDate
                );
    }

    // =========================================================
    // 10. EXPIRED CERTIFICATIONS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Calibration> getExpiredCertifications(
            LocalDate date) {

        if (date == null) {
            date = LocalDate.now();
        }

        return calibrationRepository
                .findByCertificationExpiryDateLessThanEqual(
                        date
                );
    }

    // =========================================================
    // 11. CALIBRATION REMINDERS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Calibration> getCalibrationReminders() {

        LocalDate today =
                LocalDate.now();

        LocalDate reminderDate =
                today.plusDays(
                        REMINDER_DAYS
                );

        return getUpcomingCalibrations(
                today,
                reminderDate
        );
    }

    // =========================================================
    // 12. CERTIFICATION REMINDERS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<Calibration> getCertificationReminders() {

        LocalDate today =
                LocalDate.now();

        LocalDate reminderDate =
                today.plusDays(
                        REMINDER_DAYS
                );

        return getUpcomingCertifications(
                today,
                reminderDate
        );
    }

    // =========================================================
    // TASK 6.2.3
    // NOTIFY CALIBRATION CREATED
    // =========================================================

    private void notifyCalibrationCreated(
            Calibration calibration) {

        String equipmentName =
                getEquipmentName(
                        calibration
                );

        List<User> users =
                getCalibrationNotificationUsers();

        for (User user : users) {

            notificationService
                    .createNotification(
                            user,
                            NotificationType.CALIBRATION_DUE,
                            "Calibration Scheduled",
                            "Calibration has been scheduled for equipment: "
                                    + equipmentName,
                            calibration.getId(),
                            "CALIBRATION"
                    );
        }
    }

    // =========================================================
    // TASK 6.2.3
    // NOTIFY CALIBRATION UPDATED / COMPLETED
    // =========================================================

    private void notifyCalibrationUpdated(
            Calibration calibration) {

        String equipmentName =
                getEquipmentName(
                        calibration
                );

        List<User> users =
                getCalibrationNotificationUsers();

        for (User user : users) {

            notificationService
                    .createNotification(
                            user,
                            NotificationType.CALIBRATION_DUE,
                            "Calibration Updated",
                            "Calibration record has been updated for equipment: "
                                    + equipmentName,
                            calibration.getId(),
                            "CALIBRATION"
                    );
        }
    }

    // =========================================================
    // GET CALIBRATION NOTIFICATION USERS
    // =========================================================

    private List<User>
    getCalibrationNotificationUsers() {

        List<User> users =
                new ArrayList<>();

        users.addAll(
                userRepository.findByRole(
                        Role.LAB_TECHNICIAN
                )
        );

        users.addAll(
                userRepository.findByRole(
                        Role.LAB_MANAGER
                )
        );

        users.addAll(
                userRepository.findByRole(
                        Role.INSTITUTION_ADMIN
                )
        );

        return users;
    }

    // =========================================================
    // GET EQUIPMENT NAME
    // =========================================================

    private String getEquipmentName(
            Calibration calibration) {

        if (calibration.getEquipment() == null) {
            return "Unknown Equipment";
        }

        Equipment equipment =
                calibration.getEquipment();

        if (equipment.getName() == null ||
                equipment.getName().trim().isEmpty()) {

            return "Equipment ID "
                    + equipment.getId();
        }

        return equipment.getName();
    }

    // =========================================================
    // DATE VALIDATION
    // =========================================================

    private void validateDates(
            Calibration calibration) {

        LocalDate lastCalibration =
                calibration
                        .getLastCalibrationDate();

        LocalDate nextCalibration =
                calibration
                        .getNextCalibrationDate();

        LocalDate certificationExpiry =
                calibration
                        .getCertificationExpiryDate();

        if (lastCalibration != null &&
                nextCalibration != null &&
                lastCalibration.isAfter(
                        nextCalibration
                )) {

            throw new RuntimeException(
                    "Last calibration date cannot be after "
                            + "next calibration date"
            );
        }

        if (lastCalibration != null &&
                certificationExpiry != null &&
                certificationExpiry.isBefore(
                        lastCalibration
                )) {

            throw new RuntimeException(
                    "Certification expiry date cannot be before "
                            + "last calibration date"
            );
        }
    }

    // =========================================================
    // DATE RANGE VALIDATION
    // =========================================================

    private void validateDateRange(
            LocalDate startDate,
            LocalDate endDate) {

        if (startDate == null ||
                endDate == null) {

            throw new RuntimeException(
                    "Start date and end date are required"
            );
        }

        if (startDate.isAfter(endDate)) {

            throw new RuntimeException(
                    "Start date cannot be after end date"
            );
        }
    }
}