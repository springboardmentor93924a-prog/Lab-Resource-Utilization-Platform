package com.labresource.controller;

import com.labresource.entity.Calibration;
import com.labresource.service.CalibrationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/calibration")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
public class CalibrationController {

    private final CalibrationService calibrationService;


    public CalibrationController(
            CalibrationService calibrationService) {

        this.calibrationService =
                calibrationService;
    }


    // =========================================================
    // 1. CREATE CALIBRATION
    //
    // Allowed:
    // LAB_TECHNICIAN
    // LAB_MANAGER
    // INSTITUTION_ADMIN
    // SYSTEM_ADMIN
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @PostMapping
    public ResponseEntity<?> createCalibration(
            @RequestBody Calibration calibration) {

        try {

            Calibration created =
                    calibrationService
                            .createCalibration(
                                    calibration
                            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(created);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 2. GET ALL CALIBRATIONS
    //
    // All authenticated roles
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'RESEARCHER',
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'DEPARTMENT_HEAD',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping
    public ResponseEntity<?> getAllCalibrations() {

        try {

            List<Calibration> calibrations =
                    calibrationService
                            .getAllCalibrations();

            return ResponseEntity.ok(
                    calibrations
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 3. GET CALIBRATION BY ID
    //
    // All authenticated roles
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'RESEARCHER',
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'DEPARTMENT_HEAD',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/{id}")
    public ResponseEntity<?> getCalibrationById(
            @PathVariable Long id) {

        try {

            Calibration calibration =
                    calibrationService
                            .getCalibrationById(
                                    id
                            );

            return ResponseEntity.ok(
                    calibration
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 4. GET CALIBRATION HISTORY BY EQUIPMENT
    //
    // All authenticated roles
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'RESEARCHER',
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'DEPARTMENT_HEAD',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<?> getCalibrationsByEquipment(
            @PathVariable Long equipmentId) {

        try {

            List<Calibration> calibrations =
                    calibrationService
                            .getCalibrationsByEquipment(
                                    equipmentId
                            );

            return ResponseEntity.ok(
                    calibrations
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 5. UPDATE CALIBRATION
    //
    // Allowed:
    // LAB_TECHNICIAN
    // LAB_MANAGER
    // INSTITUTION_ADMIN
    // SYSTEM_ADMIN
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCalibration(
            @PathVariable Long id,
            @RequestBody Calibration calibration) {

        try {

            Calibration updated =
                    calibrationService
                            .updateCalibration(
                                    id,
                                    calibration
                            );

            return ResponseEntity.ok(
                    updated
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 6. DELETE CALIBRATION
    //
    // Allowed:
    // LAB_MANAGER
    // INSTITUTION_ADMIN
    // SYSTEM_ADMIN
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCalibration(
            @PathVariable Long id) {

        try {

            calibrationService
                    .deleteCalibration(
                            id
                    );

            return ResponseEntity.ok(
                    "Calibration deleted successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 7. UPCOMING CALIBRATIONS
    //
    // All authenticated roles
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'RESEARCHER',
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'DEPARTMENT_HEAD',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingCalibrations(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {

        try {

            List<Calibration> calibrations =
                    calibrationService
                            .getUpcomingCalibrations(
                                    startDate,
                                    endDate
                            );

            return ResponseEntity.ok(
                    calibrations
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 8. EXPIRED CALIBRATIONS
    //
    // All authenticated roles
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'RESEARCHER',
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'DEPARTMENT_HEAD',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/expired")
    public ResponseEntity<?> getExpiredCalibrations(
            @RequestParam(required = false)
            LocalDate date) {

        try {

            List<Calibration> calibrations =
                    calibrationService
                            .getExpiredCalibrations(
                                    date
                            );

            return ResponseEntity.ok(
                    calibrations
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 9. UPCOMING CERTIFICATIONS
    //
    // All authenticated roles
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'RESEARCHER',
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'DEPARTMENT_HEAD',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/certifications/upcoming")
    public ResponseEntity<?> getUpcomingCertifications(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {

        try {

            List<Calibration> certifications =
                    calibrationService
                            .getUpcomingCertifications(
                                    startDate,
                                    endDate
                            );

            return ResponseEntity.ok(
                    certifications
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 10. EXPIRED CERTIFICATIONS
    //
    // All authenticated roles
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'RESEARCHER',
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'DEPARTMENT_HEAD',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/certifications/expired")
    public ResponseEntity<?> getExpiredCertifications(
            @RequestParam(required = false)
            LocalDate date) {

        try {

            List<Calibration> certifications =
                    calibrationService
                            .getExpiredCertifications(
                                    date
                            );

            return ResponseEntity.ok(
                    certifications
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 11. CALIBRATION REMINDERS
    //
    // All authenticated roles
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'RESEARCHER',
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'DEPARTMENT_HEAD',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/reminders")
    public ResponseEntity<?> getCalibrationReminders() {

        try {

            List<Calibration> reminders =
                    calibrationService
                            .getCalibrationReminders();

            return ResponseEntity.ok(
                    reminders
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 12. CERTIFICATION REMINDERS
    //
    // All authenticated roles
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'RESEARCHER',
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'DEPARTMENT_HEAD',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/certification-reminders")
    public ResponseEntity<?> getCertificationReminders() {

        try {

            List<Calibration> reminders =
                    calibrationService
                            .getCertificationReminders();

            return ResponseEntity.ok(
                    reminders
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}