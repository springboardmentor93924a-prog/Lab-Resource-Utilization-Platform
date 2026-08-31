package com.example.lab_platform.service;

import com.example.lab_platform.dto.DepartmentUsageReportDTO;
import com.example.lab_platform.dto.EquipmentUtilizationReportDTO;
import com.example.lab_platform.dto.MaintenanceDowntimeReportDTO;
import com.example.lab_platform.dto.ProcurementCostReportDTO;
import com.example.lab_platform.dto.SharingReportDTO;

import java.time.LocalDate;

public interface ReportService {

    EquipmentUtilizationReportDTO getEquipmentUtilizationReport(
            LocalDate startDate, LocalDate endDate,
            Integer departmentId, Integer institutionId,
            Integer equipmentId, String category);

    DepartmentUsageReportDTO getDepartmentUsageReport(
            LocalDate startDate, LocalDate endDate,
            Integer departmentId, Integer institutionId);

    MaintenanceDowntimeReportDTO getMaintenanceDowntimeReport(
            LocalDate startDate, LocalDate endDate,
            Integer departmentId, Integer institutionId, Integer equipmentId);

    SharingReportDTO getInterInstitutionSharingReport(
            LocalDate startDate, LocalDate endDate,
            Integer institutionId, String status);

    ProcurementCostReportDTO getProcurementCostReport(
            Integer departmentId, Integer institutionId,
            Integer equipmentId, String category);
}
