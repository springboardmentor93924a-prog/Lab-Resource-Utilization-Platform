package com.labresource.service.impl;

import com.labresource.dto.maintenance.MaintenanceRequest;
import com.labresource.dto.maintenance.MaintenanceResponse;
import com.labresource.entity.Equipment;
import com.labresource.entity.MaintenanceRecord;
import com.labresource.exception.ResourceNotFoundException;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.MaintenanceRecordRepository;
import com.labresource.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;




import com.labresource.dto.EquipmentStatusEventDto;
import com.labresource.service.EquipmentStatusStreamService;



import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceServiceImpl implements MaintenanceService {

    private final MaintenanceRecordRepository maintenanceRepository;
    private final EquipmentRepository equipmentRepository;
    private final EquipmentStatusStreamService equipmentStatusStreamService;

    @Override
    public MaintenanceResponse createMaintenanceRecord(
            MaintenanceRequest request
    ) {

        Equipment equipment = equipmentRepository
                .findById(request.getEquipmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Equipment not found"
                        )
                );

        MaintenanceRecord maintenance = new MaintenanceRecord();

        maintenance.setEquipment(equipment);

        maintenance.setMaintenanceType(
                request.getMaintenanceType()
        );

        maintenance.setScheduledDate(
                request.getScheduledDate() != null
                        ? request.getScheduledDate().atStartOfDay()
                        : null
        );

        maintenance.setCompletionDate(
                request.getCompletedDate() != null
                        ? request.getCompletedDate().atStartOfDay()
                        : null
        );


        maintenance.setIssueDescription(
                request.getDescription()
        );


        maintenance.setCost(
                request.getCost() != null
                        ? BigDecimal.valueOf(request.getCost())
                        : null
        );

        maintenance.setStatus(
                request.getStatus()
        );

        maintenance.setRemarks(
                request.getRemarks()
        );

        maintenance.setCreatedAt(
                LocalDateTime.now()
        );

        maintenance.setUpdatedAt(
                LocalDateTime.now()
        );

        MaintenanceRecord saved =
                maintenanceRepository.save(maintenance);








        if ("IN_PROGRESS".equalsIgnoreCase(saved.getStatus())
                || "UNDER_MAINTENANCE".equalsIgnoreCase(saved.getStatus())) {

            equipmentStatusStreamService.publish(
                    new EquipmentStatusEventDto(
                            equipment.getId(),
                            equipment.getName(),
                            "UNDER_MAINTENANCE",
                            "Equipment entered maintenance",
                            LocalDateTime.now()
                    )
            );
        }




        return mapToResponse(saved);
    }

    @Override
    public List<MaintenanceResponse> getAllMaintenanceRecords() {

        return maintenanceRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public MaintenanceResponse getMaintenanceRecordById(
            String maintenanceId
    ) {

        MaintenanceRecord maintenance = maintenanceRepository
                .findById(maintenanceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Maintenance record not found"
                        )
                );

        return mapToResponse(maintenance);
    }

    @Override
    public List<MaintenanceResponse> getMaintenanceByEquipment(
            String equipmentId
    ) {

        Equipment equipment = equipmentRepository
                .findById(equipmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Equipment not found"
                        )
                );

        return maintenanceRepository
                .findByEquipment(equipment)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<MaintenanceResponse> getMaintenanceByStatus(
            String status
    ) {

        return maintenanceRepository
                .findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<MaintenanceResponse> getMaintenanceByType(
            String maintenanceType
    ) {

        return maintenanceRepository
                .findByMaintenanceType(maintenanceType)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<MaintenanceResponse> getScheduledMaintenanceBetween(
            LocalDate startDate,
            LocalDate endDate
    ) {


        LocalDateTime startDateTime =
                startDate.atStartOfDay();

        LocalDateTime endDateTime =
                endDate.atTime(23, 59, 59);

        return maintenanceRepository
                .findByScheduledDateBetween(
                        startDateTime,
                        endDateTime
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<MaintenanceResponse> getCompletedMaintenanceBetween(
            LocalDate startDate,
            LocalDate endDate
    ) {

        LocalDateTime startDateTime =
                startDate.atStartOfDay();

        LocalDateTime endDateTime =
                endDate.atTime(23, 59, 59);

        return maintenanceRepository
                .findByCompletionDateBetween(
                        startDateTime,
                        endDateTime
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<MaintenanceResponse> searchByTechnician(
            String technicianName
    ) {


        return maintenanceRepository
                .findByTechnician_FirstNameContainingIgnoreCase(
                        technicianName
                )
                .stream()
                .map(this::mapToResponse)
                .toList();

    }

    @Override
    public MaintenanceResponse updateMaintenanceRecord(
            String maintenanceId,
            MaintenanceRequest request
    ) {

        MaintenanceRecord maintenance = maintenanceRepository
                .findById(maintenanceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Maintenance record not found"
                        )
                );

        Equipment equipment = equipmentRepository
                .findById(request.getEquipmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Equipment not found"
                        )
                );

        maintenance.setEquipment(equipment);

        maintenance.setMaintenanceType(
                request.getMaintenanceType()
        );

        maintenance.setScheduledDate(
                request.getScheduledDate() != null
                        ? request.getScheduledDate().atStartOfDay()
                        : null
        );

        maintenance.setCompletionDate(
                request.getCompletedDate() != null
                        ? request.getCompletedDate().atStartOfDay()
                        : null
        );

        maintenance.setIssueDescription(
                request.getDescription()
        );

        maintenance.setCost(
                request.getCost() != null
                        ? BigDecimal.valueOf(request.getCost())
                        : null
        );

        maintenance.setStatus(
                request.getStatus()
        );

        maintenance.setRemarks(
                request.getRemarks()
        );

        maintenance.setUpdatedAt(
                LocalDateTime.now()
        );

        MaintenanceRecord updated =
                maintenanceRepository.save(maintenance);









        if ("COMPLETED".equalsIgnoreCase(updated.getStatus())) {

            equipmentStatusStreamService.publish(
                    new EquipmentStatusEventDto(
                            equipment.getId(),
                            equipment.getName(),
                            "AVAILABLE",
                            "Equipment maintenance completed",
                            LocalDateTime.now()
                    )
            );

        } else if ("IN_PROGRESS".equalsIgnoreCase(updated.getStatus())
                || "UNDER_MAINTENANCE".equalsIgnoreCase(updated.getStatus())) {

            equipmentStatusStreamService.publish(
                    new EquipmentStatusEventDto(
                            equipment.getId(),
                            equipment.getName(),
                            "UNDER_MAINTENANCE",
                            "Equipment is under maintenance",
                            LocalDateTime.now()
                    )
            );
        }

        return mapToResponse(updated);
    }

    @Override
    public void deleteMaintenanceRecord(
            String maintenanceId
    ) {

        MaintenanceRecord maintenance = maintenanceRepository
                .findById(maintenanceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Maintenance record not found"
                        )
                );

        maintenanceRepository.delete(maintenance);
    }

    private MaintenanceResponse mapToResponse(
            MaintenanceRecord maintenance
    ) {

        String equipmentId = null;
        String equipmentName = null;

        if (maintenance.getEquipment() != null) {
            equipmentId =
                    maintenance.getEquipment().getId();

            equipmentName =
                    maintenance.getEquipment().getName();
        }

        LocalDate scheduledDate =
                maintenance.getScheduledDate() != null
                        ? maintenance
                        .getScheduledDate()
                        .toLocalDate()
                        : null;

        LocalDate completedDate =
                maintenance.getCompletionDate() != null
                        ? maintenance
                        .getCompletionDate()
                        .toLocalDate()
                        : null;

        Double cost =
                maintenance.getCost() != null
                        ? maintenance
                        .getCost()
                        .doubleValue()
                        : null;


        String technicianName = null;

        return new MaintenanceResponse(
                maintenance.getId(),
                equipmentId,
                equipmentName,
                maintenance.getMaintenanceType(),
                scheduledDate,
                completedDate,
                maintenance.getIssueDescription(),
                technicianName,
                cost,
                maintenance.getStatus(),
                maintenance.getRemarks(),
                maintenance.getCreatedAt(),
                maintenance.getUpdatedAt()
        );
    }
}