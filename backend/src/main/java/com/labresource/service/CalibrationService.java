package com.labresource.service;

import com.labresource.dto.calibration.CalibrationRequest;
import com.labresource.dto.calibration.CalibrationResponse;

import java.time.LocalDate;
import java.util.List;

public interface CalibrationService {

    CalibrationResponse createCalibrationRecord(
            CalibrationRequest request
    );

    List<CalibrationResponse> getAllCalibrationRecords();

    CalibrationResponse getCalibrationRecordById(
            String calibrationId
    );

    List<CalibrationResponse> getCalibrationByEquipment(
            String equipmentId
    );

    List<CalibrationResponse> getCalibrationByTechnician(
            String technicianId
    );

    List<CalibrationResponse> getCalibrationByStatus(
            String status
    );

    List<CalibrationResponse> getCalibrationByResult(
            String calibrationResult
    );

    List<CalibrationResponse> getCalibrationBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    List<CalibrationResponse> getUpcomingCalibrations(
            LocalDate startDate,
            LocalDate endDate
    );

    List<CalibrationResponse> searchByTechnician(
            String technicianName
    );

    CalibrationResponse updateCalibrationRecord(
            String calibrationId,
            CalibrationRequest request
    );

    void deleteCalibrationRecord(
            String calibrationId
    );
}