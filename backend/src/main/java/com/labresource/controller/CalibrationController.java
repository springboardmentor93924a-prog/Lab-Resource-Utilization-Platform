//package com.labresource.controller;
//
//import com.labresource.dto.calibration.CalibrationRequest;
//import com.labresource.dto.calibration.CalibrationResponse;
//import com.labresource.service.CalibrationService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.time.LocalDate;
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/calibrations")
//@RequiredArgsConstructor
//public class CalibrationController {
//
//    private final CalibrationService calibrationService;
//
//    @PostMapping
//    public ResponseEntity<CalibrationResponse> createCalibrationRecord(
//            @RequestBody CalibrationRequest request
//    ) {
//
//        CalibrationResponse response =
//                calibrationService.createCalibrationRecord(request);
//
//        return new ResponseEntity<>(
//                response,
//                HttpStatus.CREATED
//        );
//    }
//
//    @GetMapping
//    public ResponseEntity<List<CalibrationResponse>>
//    getAllCalibrationRecords() {
//
//        return ResponseEntity.ok(
//                calibrationService.getAllCalibrationRecords()
//        );
//    }
//
//    @GetMapping("/{calibrationId}")
//    public ResponseEntity<CalibrationResponse>
//    getCalibrationRecordById(
//            @PathVariable String calibrationId
//    ) {
//
//        return ResponseEntity.ok(
//                calibrationService.getCalibrationRecordById(
//                        calibrationId
//                )
//        );
//    }
//
//    @GetMapping("/equipment/{equipmentId}")
//    public ResponseEntity<List<CalibrationResponse>>
//    getCalibrationByEquipment(
//            @PathVariable String equipmentId
//    ) {
//
//        return ResponseEntity.ok(
//                calibrationService.getCalibrationByEquipment(
//                        equipmentId
//                )
//        );
//    }
//
//    @GetMapping("/technician/{technicianId}")
//    public ResponseEntity<List<CalibrationResponse>>
//    getCalibrationByTechnician(
//            @PathVariable String technicianId
//    ) {
//
//        return ResponseEntity.ok(
//                calibrationService.getCalibrationByTechnician(
//                        technicianId
//                )
//        );
//    }
//
//    @GetMapping("/status/{status}")
//    public ResponseEntity<List<CalibrationResponse>>
//    getCalibrationByStatus(
//            @PathVariable String status
//    ) {
//
//        return ResponseEntity.ok(
//                calibrationService.getCalibrationByStatus(status)
//        );
//    }
//
//    @GetMapping("/result/{calibrationResult}")
//    public ResponseEntity<List<CalibrationResponse>>
//    getCalibrationByResult(
//            @PathVariable String calibrationResult
//    ) {
//
//        return ResponseEntity.ok(
//                calibrationService.getCalibrationByResult(
//                        calibrationResult
//                )
//        );
//    }
//
//    @GetMapping("/between")
//    public ResponseEntity<List<CalibrationResponse>>
//    getCalibrationBetween(
//            @RequestParam LocalDate startDate,
//            @RequestParam LocalDate endDate
//    ) {
//
//        return ResponseEntity.ok(
//                calibrationService.getCalibrationBetween(
//                        startDate,
//                        endDate
//                )
//        );
//    }
//
//    @GetMapping("/upcoming")
//    public ResponseEntity<List<CalibrationResponse>>
//    getUpcomingCalibrations(
//            @RequestParam LocalDate startDate,
//            @RequestParam LocalDate endDate
//    ) {
//
//        return ResponseEntity.ok(
//                calibrationService.getUpcomingCalibrations(
//                        startDate,
//                        endDate
//                )
//        );
//    }
//
//    @GetMapping("/search-technician")
//    public ResponseEntity<List<CalibrationResponse>>
//    searchByTechnician(
//            @RequestParam String technicianName
//    ) {
//
//        return ResponseEntity.ok(
//                calibrationService.searchByTechnician(
//                        technicianName
//                )
//        );
//    }
//
//    @PutMapping("/{calibrationId}")
//    public ResponseEntity<CalibrationResponse>
//    updateCalibrationRecord(
//            @PathVariable String calibrationId,
//            @RequestBody CalibrationRequest request
//    ) {
//
//        return ResponseEntity.ok(
//                calibrationService.updateCalibrationRecord(
//                        calibrationId,
//                        request
//                )
//        );
//    }
//
//    @DeleteMapping("/{calibrationId}")
//    public ResponseEntity<Void> deleteCalibrationRecord(
//            @PathVariable String calibrationId
//    ) {
//
//        calibrationService.deleteCalibrationRecord(
//                calibrationId
//        );
//
//        return ResponseEntity.noContent().build();
//    }
//}