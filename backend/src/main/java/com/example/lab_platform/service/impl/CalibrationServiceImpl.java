package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.EquipmentCalibration;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.entity.Waitlist;
import com.example.lab_platform.repository.CalibrationRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.WaitlistRepository;
import com.example.lab_platform.service.BookingService;
import com.example.lab_platform.service.CalibrationService;
import com.example.lab_platform.service.NotificationService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CalibrationServiceImpl implements CalibrationService {

    private final CalibrationRepository calibrationRepository;
    private final EquipmentRepository equipmentRepository;
    private final WaitlistRepository waitlistRepository;
    private final NotificationService notificationService;
    private final BookingService bookingService;

    /*
     * Calibration statuses that actually take the equipment out of
     * service. "COMPLETED" (the default, used when a technician is
     * just logging calibration work that's already finished) and
     * "CANCELLED" are non-blocking — only a calibration that is
     * SCHEDULED or IN_PROGRESS locks the equipment the same way an
     * Active/Scheduled Maintenance record does.
     */
    private static boolean isBlockingStatus(String status) {
        return status != null
                && (status.equalsIgnoreCase("SCHEDULED")
                || status.equalsIgnoreCase("IN_PROGRESS"));
    }

    public CalibrationServiceImpl(
            CalibrationRepository calibrationRepository,
            EquipmentRepository equipmentRepository,
            WaitlistRepository waitlistRepository,
            NotificationService notificationService,
            BookingService bookingService) {
        this.calibrationRepository = calibrationRepository;
        this.equipmentRepository = equipmentRepository;
        this.waitlistRepository = waitlistRepository;
        this.notificationService = notificationService;
        this.bookingService = bookingService;
    }

    private User getLoggedInUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    @Override
    public List<EquipmentCalibration> getAllCalibrations() {
        return calibrationRepository.findAll();
    }

    @Override
    public EquipmentCalibration getCalibrationById(Integer id) {
        return calibrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Calibration record not found"));
    }

    @Override
    public List<EquipmentCalibration> getCalibrationsByEquipment(Integer equipmentId) {
        return calibrationRepository.findByEquipment_EquipmentId(equipmentId);
    }

    @Override
    public EquipmentCalibration createCalibration(EquipmentCalibration calibration) {
        if (calibration.getEquipment() == null || calibration.getEquipment().getEquipmentId() == null) {
            throw new RuntimeException("Equipment is required");
        }
        if (calibration.getCalibrationDate() == null) {
            throw new RuntimeException("Calibration date is required");
        }
        if (calibration.getNextCalibrationDate() == null) {
            throw new RuntimeException("Next calibration date is required");
        }
        if (!calibration.getNextCalibrationDate().isAfter(calibration.getCalibrationDate())) {
            throw new RuntimeException("Next calibration date must be after the calibration date");
        }
        // EDGE CASE: certificate can't expire before it was even calibrated
        if (calibration.getCertificateExpiryDate() != null
            && !calibration.getCertificateExpiryDate().isAfter(calibration.getCalibrationDate())) {
            throw new RuntimeException("Certificate expiry date must be after the calibration date");
        }

        Equipment equipment = equipmentRepository.findById(calibration.getEquipment().getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        // calibratedBy is derived from the logged-in technician, never trusted
        // from the request body — same reasoning as receiverInstitution in
        // ResourceSharingServiceImpl.
        User loggedInUser = getLoggedInUser();

        calibration.setEquipment(equipment);
        calibration.setCalibratedBy(loggedInUser.getFullName());

        if (calibration.getCalibrationStatus() == null || calibration.getCalibrationStatus().isBlank()) {
            calibration.setCalibrationStatus("COMPLETED");
        }

        EquipmentCalibration saved = calibrationRepository.save(calibration);

        syncEquipmentStatus(equipment);

        return saved;
    }

    @Override
    public EquipmentCalibration updateCalibration(Integer id, EquipmentCalibration updated) {
        EquipmentCalibration existing = calibrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Calibration record not found"));

        if (updated.getCalibrationDate() != null) {
            existing.setCalibrationDate(updated.getCalibrationDate());
        }
        if (updated.getNextCalibrationDate() != null) {
            existing.setNextCalibrationDate(updated.getNextCalibrationDate());
        }
        if (updated.getCalibrationStatus() != null) {
            existing.setCalibrationStatus(updated.getCalibrationStatus());
        }
        if (updated.getCertificateNumber() != null) {
            existing.setCertificateNumber(updated.getCertificateNumber());
        }
        if (updated.getRemarks() != null) {
            existing.setRemarks(updated.getRemarks());
        }

        EquipmentCalibration saved = calibrationRepository.save(existing);
        if (updated.getCertificateExpiryDate() != null) {
            existing.setCertificateExpiryDate(updated.getCertificateExpiryDate());
        }

        syncEquipmentStatus(existing.getEquipment());

        return saved;
    }

    /*
     * Keeps Equipment.status in step with its calibration records,
     * the same way MaintenanceServiceImpl.syncEquipmentStatus() does
     * for maintenance:
     *
     *   - If any SCHEDULED/IN_PROGRESS calibration record exists for
     *     this equipment, it is locked to "In Calibration" (blocks
     *     new bookings the same way "Under Maintenance" does), and —
     *     the FIRST time it enters that state — everyone currently
     *     WAITING/NOTIFIED on its waitlist is notified.
     *   - Otherwise (only COMPLETED/CANCELLED records, or none), the
     *     equipment is released back to "Available" and the waitlist
     *     cascade is run so anyone queued gets auto-allocated if their
     *     requested window is free.
     */
    private void syncEquipmentStatus(Equipment equipment) {
        if (equipment == null) {
            return;
        }

        boolean currentlyBlocked = calibrationRepository
                .findByEquipment_EquipmentId(equipment.getEquipmentId())
                .stream()
                .anyMatch(c -> isBlockingStatus(c.getCalibrationStatus()));

        boolean wasAlreadyInCalibration =
                "In Calibration".equalsIgnoreCase(equipment.getStatus());

        if (currentlyBlocked) {
            equipment.setStatus("In Calibration");
            equipmentRepository.save(equipment);

            if (!wasAlreadyInCalibration) {
                notifyWaitlistOfCalibration(equipment);
            }
            return;
        }

        if (wasAlreadyInCalibration) {
            equipment.setStatus("Available");
            equipmentRepository.save(equipment);

            // Same cascade used everywhere else equipment frees up —
            // walks the whole active queue (priority first, then
            // earliest queueDate), not just the first entry, so no one
            // silently stalls if the person ahead of them can't be
            // auto-allocated.
            bookingService.processWaitlistForEquipment(equipment.getEquipmentId());
        }
    }

    /*
     * Notifies everyone currently active (WAITING/NOTIFIED) on this
     * equipment's waitlist that it has just gone into calibration, so
     * they know why it isn't bookable right now instead of finding out
     * only when their own allocation attempt silently fails.
     */
    private void notifyWaitlistOfCalibration(Equipment equipment) {
        List<Waitlist> activeEntries =
                waitlistRepository
                        .findByEquipment_EquipmentIdAndWaitlistStatusInOrderByIsPriorityDescQueueDateAscCreatedAtAsc(
                                equipment.getEquipmentId(),
                                List.of("WAITING", "NOTIFIED")
                        );

        for (Waitlist entry : activeEntries) {
            notificationService.create(
                    entry.getUser(),
                    "EQUIPMENT_IN_CALIBRATION",
                    "Equipment now in calibration",
                    equipment.getEquipmentName()
                            + " has been placed into calibration and is unavailable for now. "
                            + "You'll be notified when it's available again.",
                    equipment.getEquipmentId()
            );
        }
    }

    @Override
    public List<EquipmentCalibration> getDueSoon(int withinDays) {
        LocalDate today = LocalDate.now();
        return calibrationRepository.findByNextCalibrationDateBetween(
                today, today.plusDays(withinDays)
        );
    }

    @Override
    public List<EquipmentCalibration> getOverdue() {
        return calibrationRepository.findByNextCalibrationDateLessThanEqual(LocalDate.now());
    }

    @Override
    public List<EquipmentCalibration> getCertificationExpiringSoon(int withinDays) {
        LocalDate today = LocalDate.now();
    // EDGE CASE: certificateExpiryDate is optional — records that never
    // set it are simply excluded by the query (null never matches a range).
        return calibrationRepository.findByCertificateExpiryDateBetween(
            today, today.plusDays(withinDays)
        );
    }   

    @Override
    public List<EquipmentCalibration> getCertificationExpired() {
        return calibrationRepository.findByCertificateExpiryDateLessThanEqual(LocalDate.now());
    }
}