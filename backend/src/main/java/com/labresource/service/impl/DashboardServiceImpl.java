package com.labresource.service.impl;

import com.labresource.dto.dashboard.DashboardResponse;
import com.labresource.repository.BookingRepository;
import com.labresource.repository.CalibrationRecordRepository;
import com.labresource.repository.DepartmentRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.MaintenanceRecordRepository;
import com.labresource.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final InstitutionRepository institutionRepository;
    private final DepartmentRepository departmentRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final CalibrationRecordRepository calibrationRecordRepository;

    @Override
    public DashboardResponse getDashboardSummary() {

        long totalInstitutions = institutionRepository.count();

        long totalDepartments = departmentRepository.count();

        long totalEquipment = equipmentRepository.count();

        long availableEquipment =
                equipmentRepository
                        .findByAvailabilityStatusIgnoreCase("AVAILABLE")
                        .size();

        long bookedEquipment =
                equipmentRepository
                        .findByAvailabilityStatusIgnoreCase("BOOKED")
                        .size();

        long underMaintenance =
                equipmentRepository
                        .findByStatusIgnoreCase("UNDER_MAINTENANCE")
                        .size();

        long underCalibration =
                equipmentRepository
                        .findByStatusIgnoreCase("UNDER_CALIBRATION")
                        .size();

        long outOfService =
                equipmentRepository
                        .findByStatusIgnoreCase("OUT_OF_SERVICE")
                        .size();

        long totalBookings =
                bookingRepository.count();

        long totalMaintenanceRecords =
                maintenanceRecordRepository.count();

        long totalCalibrationRecords =
                calibrationRecordRepository.count();

        return new DashboardResponse(

                totalInstitutions,
                totalDepartments,
                totalEquipment,

                availableEquipment,
                bookedEquipment,
                underMaintenance,
                underCalibration,
                outOfService,

                totalBookings,
                totalMaintenanceRecords,
                totalCalibrationRecords
        );
    }
}