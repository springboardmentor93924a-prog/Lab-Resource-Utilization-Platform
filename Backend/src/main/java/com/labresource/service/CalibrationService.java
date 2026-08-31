package com.labresource.service;

import com.labresource.entity.Calibration;

import java.time.LocalDate;
import java.util.List;

public interface CalibrationService {

    // =========================================================
    // 1. CREATE CALIBRATION
    // =========================================================

    Calibration createCalibration(
            Calibration calibration
    );

    // =========================================================
    // 2. GET ALL CALIBRATIONS
    // =========================================================

    List<Calibration> getAllCalibrations();

    // =========================================================
    // 3. GET CALIBRATION BY ID
    // =========================================================

    Calibration getCalibrationById(
            Long id
    );

    // =========================================================
    // 4. GET CALIBRATION HISTORY BY EQUIPMENT
    // =========================================================

    List<Calibration> getCalibrationsByEquipment(
            Long equipmentId
    );

    // =========================================================
    // 5. UPDATE CALIBRATION
    // =========================================================

    Calibration updateCalibration(
            Long id,
            Calibration calibration
    );

    // =========================================================
    // 6. DELETE CALIBRATION
    // =========================================================

    void deleteCalibration(
            Long id
    );

    // =========================================================
    // 7. UPCOMING CALIBRATIONS
    // =========================================================

    List<Calibration> getUpcomingCalibrations(
            LocalDate startDate,
            LocalDate endDate
    );

    // =========================================================
    // 8. EXPIRED CALIBRATIONS
    // =========================================================

    List<Calibration> getExpiredCalibrations(
            LocalDate date
    );

    // =========================================================
    // 9. UPCOMING CERTIFICATIONS
    // =========================================================

    List<Calibration> getUpcomingCertifications(
            LocalDate startDate,
            LocalDate endDate
    );

    // =========================================================
    // 10. EXPIRED CERTIFICATIONS
    // =========================================================

    List<Calibration> getExpiredCertifications(
            LocalDate date
    );

    // =========================================================
    // 11. CALIBRATION REMINDERS
    // =========================================================
    // Returns calibrations whose next calibration
    // date falls within the reminder window.

    List<Calibration> getCalibrationReminders();

    // =========================================================
    // 12. CERTIFICATION REMINDERS
    // =========================================================
    // Returns certifications whose expiry date
    // falls within the reminder window.

    List<Calibration> getCertificationReminders();
}