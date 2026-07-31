package com.labresource.service.impl;

import com.labresource.dto.calibration.CalibrationRequest;
import com.labresource.dto.calibration.CalibrationResponse;
import com.labresource.entity.CalibrationRecord;
import com.labresource.entity.Equipment;
import com.labresource.entity.User;
import com.labresource.exception.ResourceNotFoundException;
import com.labresource.repository.CalibrationRecordRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.UserRepository;
import com.labresource.service.CalibrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CalibrationServiceImpl implements CalibrationService {

    private final CalibrationRecordRepository calibrationRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    @Override
    public CalibrationResponse createCalibrationRecord(
            CalibrationRequest request
    ) {

        Equipment equipment = equipmentRepository
                .findById(request.getEquipmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Equipment not found"
                        )
                );

        User technician = null;

        if (request.getTechnicianId() != null
                && !request.getTechnicianId().isBlank()) {

            technician = userRepository
                    .findById(request.getTechnicianId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Technician not found"
                            )
                    );
        }

        CalibrationRecord calibration = new CalibrationRecord();

        calibration.setEquipment(equipment);
        calibration.setTechnician(technician);
        calibration.setCalibrationDate(
                request.getCalibrationDate()
        );
        calibration.setNextCalibrationDate(
                request.getNextCalibrationDate()
        );
        calibration.setCalibrationResult(
                request.getCalibrationResult()
        );
        calibration.setCertificateUrl(
                request.getCertificateUrl()
        );
        calibration.setRemarks(
                request.getRemarks()
        );
        calibration.setStatus(
                request.getStatus()
        );
        calibration.setCreatedAt(
                LocalDateTime.now()
        );

        CalibrationRecord saved =
                calibrationRepository.save(calibration);

        return mapToResponse(saved);
    }

    @Override
    public List<CalibrationResponse> getAllCalibrationRecords() {

        return calibrationRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CalibrationResponse getCalibrationRecordById(
            String calibrationId
    ) {

        CalibrationRecord calibration =
                calibrationRepository
                        .findById(calibrationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Calibration record not found"
                                )
                        );

        return mapToResponse(calibration);
    }

    @Override
    public List<CalibrationResponse> getCalibrationByEquipment(
            String equipmentId
    ) {

        Equipment equipment = equipmentRepository
                .findById(equipmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Equipment not found"
                        )
                );

        return calibrationRepository
                .findByEquipment(equipment)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CalibrationResponse> getCalibrationByTechnician(
            String technicianId
    ) {

        User technician = userRepository
                .findById(technicianId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Technician not found"
                        )
                );

        return calibrationRepository
                .findByTechnician(technician)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CalibrationResponse> getCalibrationByStatus(
            String status
    ) {

        return calibrationRepository
                .findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CalibrationResponse> getCalibrationByResult(
            String calibrationResult
    ) {

        return calibrationRepository
                .findByCalibrationResult(calibrationResult)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CalibrationResponse> getCalibrationBetween(
            LocalDate startDate,
            LocalDate endDate
    ) {

        return calibrationRepository
                .findByCalibrationDateBetween(
                        startDate,
                        endDate
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CalibrationResponse> getUpcomingCalibrations(
            LocalDate startDate,
            LocalDate endDate
    ) {

        return calibrationRepository
                .findByNextCalibrationDateBetween(
                        startDate,
                        endDate
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CalibrationResponse> searchByTechnician(
            String technicianName
    ) {

        return calibrationRepository
                .findByTechnician_FirstNameContainingIgnoreCase(
                        technicianName
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CalibrationResponse updateCalibrationRecord(
            String calibrationId,
            CalibrationRequest request
    ) {

        CalibrationRecord calibration =
                calibrationRepository
                        .findById(calibrationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Calibration record not found"
                                )
                        );

        Equipment equipment = equipmentRepository
                .findById(request.getEquipmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Equipment not found"
                        )
                );

        User technician = null;

        if (request.getTechnicianId() != null
                && !request.getTechnicianId().isBlank()) {

            technician = userRepository
                    .findById(request.getTechnicianId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Technician not found"
                            )
                    );
        }

        calibration.setEquipment(equipment);
        calibration.setTechnician(technician);
        calibration.setCalibrationDate(
                request.getCalibrationDate()
        );
        calibration.setNextCalibrationDate(
                request.getNextCalibrationDate()
        );
        calibration.setCalibrationResult(
                request.getCalibrationResult()
        );
        calibration.setCertificateUrl(
                request.getCertificateUrl()
        );
        calibration.setRemarks(
                request.getRemarks()
        );
        calibration.setStatus(
                request.getStatus()
        );

        CalibrationRecord updated =
                calibrationRepository.save(calibration);

        return mapToResponse(updated);
    }

    @Override
    public void deleteCalibrationRecord(
            String calibrationId
    ) {

        CalibrationRecord calibration =
                calibrationRepository
                        .findById(calibrationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Calibration record not found"
                                )
                        );

        calibrationRepository.delete(calibration);
    }

    private CalibrationResponse mapToResponse(
            CalibrationRecord calibration
    ) {

        String equipmentId = null;
        String equipmentName = null;

        if (calibration.getEquipment() != null) {
            equipmentId =
                    calibration.getEquipment().getId();

            equipmentName =
                    calibration.getEquipment().getName();
        }

        String technicianId = null;
        String technicianName = null;

        if (calibration.getTechnician() != null) {
            technicianId =
                    calibration.getTechnician().getId();

            technicianName =
                    calibration.getTechnician().getFirstName();
        }

        return new CalibrationResponse(
                calibration.getId(),
                equipmentId,
                equipmentName,
                technicianId,
                technicianName,
                calibration.getCalibrationDate(),
                calibration.getNextCalibrationDate(),
                calibration.getCalibrationResult(),
                calibration.getCertificateUrl(),
                calibration.getRemarks(),
                calibration.getStatus(),
                calibration.getCreatedAt()
        );
    }
}