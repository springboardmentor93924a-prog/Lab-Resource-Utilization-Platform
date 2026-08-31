package com.infosys.labresource.Equipment.controllers;

import com.infosys.labresource.Equipment.dtos.CalibRecordRequestDTO;
import com.infosys.labresource.Equipment.entity.CalibrationRecord;
import com.infosys.labresource.Equipment.services.CalibrationRecordService;
import lombok.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/equipment/calibration")
@RequiredArgsConstructor
public class CalibrationRecordController {
    private final CalibrationRecordService calibrationRecordService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<CalibrationRecord> createCalibrationRecord(@RequestBody CalibRecordRequestDTO requestDTO) {

        return new ResponseEntity<>(calibrationRecordService.createCalibrationRecord(requestDTO), HttpStatus.CREATED
        );
    }

    @GetMapping("/equipment/{equipmentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CalibrationRecord> getByEquipment(
            @PathVariable Long equipmentId) {

        return ResponseEntity.ok(
                calibrationRecordService
                        .getCalibrationRecordByEquipmentId(equipmentId)
        );
    }

    @PutMapping("/{calibrationId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<CalibrationRecord> updateCalibrationRecord(@PathVariable Long calibrationId, @RequestBody CalibRecordRequestDTO requestDTO) {

        return ResponseEntity.ok(calibrationRecordService.updateCalibrationRecord(calibrationId, requestDTO));
    }

    @DeleteMapping("/{calibrationId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','LAB_MANAGER')")
    public ResponseEntity<String> deleteCalibrationRecord(@PathVariable Long calibrationId) {

        calibrationRecordService.deleteCalibrationRecord(calibrationId);

        return ResponseEntity.ok("Calibration record deleted successfully.");
    }
}
