package com.labresource.controller;

import com.labresource.entity.Calibration;
import com.labresource.service.CalibrationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

        this.calibrationService = calibrationService;
    }

    // =========================================================
    // 1. CREATE CALIBRATION
    // =========================================================
    // POST /api/calibration
    //
    // Body:
    // {
    //   "equipment": {
    //      "id": 1
    //   },
    //   "lastCalibrationDate": "2026-08-01",
    //   "nextCalibrationDate": "2027-08-01",
    //   "certificateNumber": "CERT-001",
    //   "certificationDetails": "ISO Calibration Certificate",
    //   "certificationExpiryDate": "2027-08-01",
    //   "performedBy": "ABC Calibration Lab",
    //   "remarks": "Calibration completed successfully"
    // }
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createCalibration(
            @RequestBody Calibration calibration) {

        try {

            Calibration created =
                    calibrationService
                            .createCalibration(calibration);

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
    // =========================================================
    // GET /api/calibration
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getAllCalibrations() {

        try {

            List<Calibration> calibrations =
                    calibrationService
                            .getAllCalibrations();

            return ResponseEntity.ok(calibrations);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // 3. GET CALIBRATION BY ID
    // =========================================================
    // GET /api/calibration/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getCalibrationById(
            @PathVariable Long id) {

        try {

            Calibration calibration =
                    calibrationService
                            .getCalibrationById(id);

            return ResponseEntity.ok(calibration);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // 4. GET CALIBRATION HISTORY BY EQUIPMENT
    // =========================================================
    // GET /api/calibration/equipment/{equipmentId}
    // =========================================================

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<?> getCalibrationsByEquipment(
            @PathVariable Long equipmentId) {

        try {

            List<Calibration> calibrations =
                    calibrationService
                            .getCalibrationsByEquipment(
                                    equipmentId
                            );

            return ResponseEntity.ok(calibrations);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // 5. UPDATE CALIBRATION
    // =========================================================
    // PUT /api/calibration/{id}
    // =========================================================

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

            return ResponseEntity.ok(updated);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // 6. DELETE CALIBRATION
    // =========================================================
    // DELETE /api/calibration/{id}
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCalibration(
            @PathVariable Long id) {

        try {

            calibrationService
                    .deleteCalibration(id);

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
    // =========================================================
    // GET /api/calibration/upcoming
    //
    // Example:
    // /api/calibration/upcoming?startDate=2026-08-22&endDate=2026-09-21
    // =========================================================

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

            return ResponseEntity.ok(calibrations);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // 8. EXPIRED CALIBRATIONS
    // =========================================================
    // GET /api/calibration/expired
    //
    // Example:
    // /api/calibration/expired?date=2026-08-22
    //
    // Date is optional.
    // If omitted, today's date is used by service.
    // =========================================================

    @GetMapping("/expired")
    public ResponseEntity<?> getExpiredCalibrations(
            @RequestParam(required = false)
            LocalDate date) {

        try {

            List<Calibration> calibrations =
                    calibrationService
                            .getExpiredCalibrations(date);

            return ResponseEntity.ok(calibrations);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // 9. UPCOMING CERTIFICATIONS
    // =========================================================
    // GET /api/calibration/certifications/upcoming
    //
    // Example:
    // /api/calibration/certifications/upcoming
    //     ?startDate=2026-08-22
    //     &endDate=2026-09-21
    // =========================================================

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

            return ResponseEntity.ok(certifications);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // 10. EXPIRED CERTIFICATIONS
    // =========================================================
    // GET /api/calibration/certifications/expired
    //
    // Date is optional.
    // =========================================================

    @GetMapping("/certifications/expired")
    public ResponseEntity<?> getExpiredCertifications(
            @RequestParam(required = false)
            LocalDate date) {

        try {

            List<Calibration> certifications =
                    calibrationService
                            .getExpiredCertifications(date);

            return ResponseEntity.ok(certifications);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // 11. CALIBRATION REMINDERS
    // =========================================================
    // GET /api/calibration/reminders
    //
    // Uses the 30-day reminder window defined
    // inside CalibrationServiceImpl.
    // =========================================================

    @GetMapping("/reminders")
    public ResponseEntity<?> getCalibrationReminders() {

        try {

            List<Calibration> reminders =
                    calibrationService
                            .getCalibrationReminders();

            return ResponseEntity.ok(reminders);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // 12. CERTIFICATION REMINDERS
    // =========================================================
    // GET /api/calibration/certification-reminders
    //
    // Uses the 30-day reminder window defined
    // inside CalibrationServiceImpl.
    // =========================================================

    @GetMapping("/certification-reminders")
    public ResponseEntity<?> getCertificationReminders() {

        try {

            List<Calibration> reminders =
                    calibrationService
                            .getCertificationReminders();

            return ResponseEntity.ok(reminders);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}