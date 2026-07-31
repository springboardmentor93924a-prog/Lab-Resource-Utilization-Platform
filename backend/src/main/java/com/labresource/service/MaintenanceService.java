package com.labresource.service;

import com.labresource.dto.maintenance.MaintenanceRequest;
import com.labresource.dto.maintenance.MaintenanceResponse;

import java.time.LocalDate;
import java.util.List;

public interface MaintenanceService {

    MaintenanceResponse createMaintenanceRecord(
            MaintenanceRequest request
    );

    List<MaintenanceResponse> getAllMaintenanceRecords();

    MaintenanceResponse getMaintenanceRecordById(
            String maintenanceId
    );

    List<MaintenanceResponse> getMaintenanceByEquipment(
            String equipmentId
    );

    List<MaintenanceResponse> getMaintenanceByStatus(
            String status
    );

    List<MaintenanceResponse> getMaintenanceByType(
            String maintenanceType
    );

    List<MaintenanceResponse> getScheduledMaintenanceBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    List<MaintenanceResponse> getCompletedMaintenanceBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    List<MaintenanceResponse> searchByTechnician(
            String technicianName
    );

    MaintenanceResponse updateMaintenanceRecord(
            String maintenanceId,
            MaintenanceRequest request
    );

    void deleteMaintenanceRecord(
            String maintenanceId
    );
}

//User
//   │
//   ▼
//MaintenanceController
//   │
//   ▼
//MaintenanceService
//   │
//   ▼
//MaintenanceRecordRepository
//   │
//   ▼
//Database
















//    //Create Request
/// /      │
/// /      ▼
/// /Find Equipment
/// /      │
/// /      ▼
/// /Create MaintenanceRecord
/// /      │
/// /      ▼
/// /Save
/// /      │
/// /      ▼
/// /Return DTO