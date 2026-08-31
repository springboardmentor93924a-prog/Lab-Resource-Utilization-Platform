
package com.labresource.repository;

import com.labresource.entity.Calibration;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CalibrationRepository
        extends JpaRepository<Calibration, Long> {

    // =========================================================
    // FIND CALIBRATIONS BY EQUIPMENT
    // =========================================================

    List<Calibration> findByEquipmentId(Long equipmentId);

    // =========================================================
    // CALIBRATION RENEWAL
    // Find calibrations whose next calibration date
    // is before or equal to the supplied date.
    // =========================================================

    List<Calibration> findByNextCalibrationDateLessThanEqual(
            LocalDate date
    );

    // =========================================================
    // UPCOMING CALIBRATIONS
    // Find calibrations between two dates.
    // =========================================================

    List<Calibration> findByNextCalibrationDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    // =========================================================
    // EXPIRED CERTIFICATIONS
    // =========================================================

    List<Calibration> findByCertificationExpiryDateLessThanEqual(
            LocalDate date
    );

    // =========================================================
    // UPCOMING CERTIFICATION EXPIRY
    // =========================================================

    List<Calibration> findByCertificationExpiryDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    // =========================================================
    // CERTIFICATE NUMBER
    // =========================================================

    List<Calibration> findByCertificateNumber(
            String certificateNumber
    );
}
