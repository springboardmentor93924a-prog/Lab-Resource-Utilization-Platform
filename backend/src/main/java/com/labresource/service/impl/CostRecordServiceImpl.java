package com.labresource.service.impl;

import com.labresource.dto.CostRecordRequestDto;
import com.labresource.dto.CostRecordResponseDto;
import com.labresource.entity.CalibrationRecord;
import com.labresource.entity.CostRecord;
import com.labresource.entity.Equipment;
import com.labresource.entity.Institution;
import com.labresource.entity.MaintenanceRecord;
import com.labresource.entity.User;
import com.labresource.repository.CalibrationRecordRepository;
import com.labresource.repository.CostRecordRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.MaintenanceRecordRepository;
import com.labresource.repository.UserRepository;
import com.labresource.service.CostRecordService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CostRecordServiceImpl implements CostRecordService {

    private final CostRecordRepository costRecordRepository;
    private final EquipmentRepository equipmentRepository;
    private final InstitutionRepository institutionRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final CalibrationRecordRepository calibrationRecordRepository;
    private final UserRepository userRepository;

    public CostRecordServiceImpl(
            CostRecordRepository costRecordRepository,
            EquipmentRepository equipmentRepository,
            InstitutionRepository institutionRepository,
            MaintenanceRecordRepository maintenanceRecordRepository,
            CalibrationRecordRepository calibrationRecordRepository,
            UserRepository userRepository
    ) {
        this.costRecordRepository = costRecordRepository;
        this.equipmentRepository = equipmentRepository;
        this.institutionRepository = institutionRepository;
        this.maintenanceRecordRepository = maintenanceRecordRepository;
        this.calibrationRecordRepository = calibrationRecordRepository;
        this.userRepository = userRepository;
    }

    @Override
    public CostRecordResponseDto createCostRecord(
            CostRecordRequestDto dto
    ) {

        if (dto.getInvoiceNumber() != null
                && !dto.getInvoiceNumber().isBlank()
                && costRecordRepository.existsByInvoiceNumberIgnoreCase(
                dto.getInvoiceNumber()
        )) {

            throw new RuntimeException(
                    "Invoice number already exists"
            );
        }

        Institution institution = institutionRepository
                .findById(dto.getInstitutionId())
                .orElseThrow(() ->
                        new RuntimeException("Institution not found"));

        User createdBy = userRepository
                .findById(dto.getCreatedByUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Equipment equipment = null;

        if (dto.getEquipmentId() != null
                && !dto.getEquipmentId().isBlank()) {

            equipment = equipmentRepository
                    .findById(dto.getEquipmentId())
                    .orElseThrow(() ->
                            new RuntimeException("Equipment not found"));
        }

        MaintenanceRecord maintenanceRecord = null;

        if (dto.getMaintenanceRecordId() != null
                && !dto.getMaintenanceRecordId().isBlank()) {

            maintenanceRecord = maintenanceRecordRepository
                    .findById(dto.getMaintenanceRecordId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Maintenance record not found"
                            ));
        }

        CalibrationRecord calibrationRecord = null;

        if (dto.getCalibrationRecordId() != null
                && !dto.getCalibrationRecordId().isBlank()) {

            calibrationRecord = calibrationRecordRepository
                    .findById(dto.getCalibrationRecordId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Calibration record not found"
                            ));
        }

        CostRecord costRecord = new CostRecord();

        costRecord.setEquipment(equipment);
        costRecord.setInstitution(institution);
        costRecord.setMaintenanceRecord(maintenanceRecord);
        costRecord.setCalibrationRecord(calibrationRecord);
        costRecord.setCreatedBy(createdBy);

        costRecord.setCostType(dto.getCostType());
        costRecord.setAmount(dto.getAmount());
        costRecord.setCurrency(dto.getCurrency());
        costRecord.setCostDate(dto.getCostDate());

        costRecord.setDescription(dto.getDescription());
        costRecord.setVendorName(dto.getVendorName());
        costRecord.setInvoiceNumber(dto.getInvoiceNumber());
        costRecord.setReceiptUrl(dto.getReceiptUrl());
        costRecord.setPaymentStatus(dto.getPaymentStatus());

        CostRecord savedCostRecord =
                costRecordRepository.save(costRecord);

        return mapToResponse(savedCostRecord);
    }

    @Override
    public CostRecordResponseDto updateCostRecord(
            String costRecordId,
            CostRecordRequestDto dto
    ) {

        CostRecord costRecord = costRecordRepository
                .findById(costRecordId)
                .orElseThrow(() ->
                        new RuntimeException("Cost record not found"));

        if (dto.getInvoiceNumber() != null
                && !dto.getInvoiceNumber().isBlank()
                && !dto.getInvoiceNumber().equalsIgnoreCase(
                costRecord.getInvoiceNumber()
        )
                && costRecordRepository.existsByInvoiceNumberIgnoreCase(
                dto.getInvoiceNumber()
        )) {

            throw new RuntimeException(
                    "Invoice number already exists"
            );
        }

        Institution institution = institutionRepository
                .findById(dto.getInstitutionId())
                .orElseThrow(() ->
                        new RuntimeException("Institution not found"));

        User createdBy = userRepository
                .findById(dto.getCreatedByUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Equipment equipment = null;

        if (dto.getEquipmentId() != null
                && !dto.getEquipmentId().isBlank()) {

            equipment = equipmentRepository
                    .findById(dto.getEquipmentId())
                    .orElseThrow(() ->
                            new RuntimeException("Equipment not found"));
        }

        MaintenanceRecord maintenanceRecord = null;

        if (dto.getMaintenanceRecordId() != null
                && !dto.getMaintenanceRecordId().isBlank()) {

            maintenanceRecord = maintenanceRecordRepository
                    .findById(dto.getMaintenanceRecordId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Maintenance record not found"
                            ));
        }

        CalibrationRecord calibrationRecord = null;

        if (dto.getCalibrationRecordId() != null
                && !dto.getCalibrationRecordId().isBlank()) {

            calibrationRecord = calibrationRecordRepository
                    .findById(dto.getCalibrationRecordId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Calibration record not found"
                            ));
        }

        costRecord.setEquipment(equipment);
        costRecord.setInstitution(institution);
        costRecord.setMaintenanceRecord(maintenanceRecord);
        costRecord.setCalibrationRecord(calibrationRecord);
        costRecord.setCreatedBy(createdBy);

        costRecord.setCostType(dto.getCostType());
        costRecord.setAmount(dto.getAmount());
        costRecord.setCurrency(dto.getCurrency());
        costRecord.setCostDate(dto.getCostDate());

        costRecord.setDescription(dto.getDescription());
        costRecord.setVendorName(dto.getVendorName());
        costRecord.setInvoiceNumber(dto.getInvoiceNumber());
        costRecord.setReceiptUrl(dto.getReceiptUrl());
        costRecord.setPaymentStatus(dto.getPaymentStatus());

        CostRecord updatedCostRecord =
                costRecordRepository.save(costRecord);

        return mapToResponse(updatedCostRecord);
    }

    @Override
    public CostRecordResponseDto getCostRecordById(
            String costRecordId
    ) {

        CostRecord costRecord = costRecordRepository
                .findById(costRecordId)
                .orElseThrow(() ->
                        new RuntimeException("Cost record not found"));

        return mapToResponse(costRecord);
    }

    @Override
    public List<CostRecordResponseDto> getAllCostRecords() {

        return costRecordRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CostRecordResponseDto> getCostRecordsByEquipment(
            String equipmentId
    ) {

        Equipment equipment = equipmentRepository
                .findById(equipmentId)
                .orElseThrow(() ->
                        new RuntimeException("Equipment not found"));

        return costRecordRepository.findByEquipment(equipment)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CostRecordResponseDto> getCostRecordsByInstitution(
            String institutionId
    ) {

        Institution institution = institutionRepository
                .findById(institutionId)
                .orElseThrow(() ->
                        new RuntimeException("Institution not found"));

        return costRecordRepository.findByInstitution(institution)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CostRecordResponseDto> getCostRecordsByMaintenance(
            String maintenanceRecordId
    ) {

        MaintenanceRecord maintenanceRecord =
                maintenanceRecordRepository
                        .findById(maintenanceRecordId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Maintenance record not found"
                                ));

        return costRecordRepository
                .findByMaintenanceRecord(maintenanceRecord)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CostRecordResponseDto> getCostRecordsByCalibration(
            String calibrationRecordId
    ) {

        CalibrationRecord calibrationRecord =
                calibrationRecordRepository
                        .findById(calibrationRecordId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Calibration record not found"
                                ));

        return costRecordRepository
                .findByCalibrationRecord(calibrationRecord)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CostRecordResponseDto> getCostRecordsByCostType(
            String costType
    ) {

        return costRecordRepository
                .findByCostTypeIgnoreCase(costType)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CostRecordResponseDto> getCostRecordsByPaymentStatus(
            String paymentStatus
    ) {

        return costRecordRepository
                .findByPaymentStatusIgnoreCase(paymentStatus)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CostRecordResponseDto> getCostRecordsByDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateDateRange(startDate, endDate);

        return costRecordRepository
                .findByCostDateBetween(startDate, endDate)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<CostRecordResponseDto>
    getInstitutionCostRecordsByDateRange(
            String institutionId,
            LocalDate startDate,
            LocalDate endDate
    ) {

        validateDateRange(startDate, endDate);

        Institution institution = institutionRepository
                .findById(institutionId)
                .orElseThrow(() ->
                        new RuntimeException("Institution not found"));

        return costRecordRepository
                .findByInstitutionAndCostDateBetween(
                        institution,
                        startDate,
                        endDate
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void deleteCostRecord(
            String costRecordId
    ) {

        CostRecord costRecord = costRecordRepository
                .findById(costRecordId)
                .orElseThrow(() ->
                        new RuntimeException("Cost record not found"));

        costRecordRepository.delete(costRecord);
    }

    private void validateDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (startDate == null || endDate == null) {
            throw new RuntimeException(
                    "Start date and end date are required"
            );
        }

        if (endDate.isBefore(startDate)) {
            throw new RuntimeException(
                    "End date cannot be before start date"
            );
        }
    }

    private CostRecordResponseDto mapToResponse(
            CostRecord costRecord
    ) {

        CostRecordResponseDto dto =
                new CostRecordResponseDto();

        dto.setId(costRecord.getId());

        if (costRecord.getEquipment() != null) {
            dto.setEquipmentId(
                    costRecord.getEquipment().getId()
            );

            dto.setEquipmentName(
                    costRecord.getEquipment().getName()
            );
        }

        if (costRecord.getInstitution() != null) {
            dto.setInstitutionId(
                    costRecord.getInstitution().getId()
            );

            dto.setInstitutionName(
                    costRecord.getInstitution().getName()
            );
        }

        if (costRecord.getMaintenanceRecord() != null) {
            dto.setMaintenanceRecordId(
                    costRecord.getMaintenanceRecord().getId()
            );
        }

        if (costRecord.getCalibrationRecord() != null) {
            dto.setCalibrationRecordId(
                    costRecord.getCalibrationRecord().getId()
            );
        }

        if (costRecord.getCreatedBy() != null) {
            dto.setCreatedByUserId(
                    costRecord.getCreatedBy().getId()
            );

            String firstName =
                    costRecord.getCreatedBy().getFirstName();

            String lastName =
                    costRecord.getCreatedBy().getLastName();

            String fullName =
                    (firstName == null ? "" : firstName)
                            + " "
                            + (lastName == null ? "" : lastName);

            dto.setCreatedByUserName(fullName.trim());
        }

        dto.setCostType(costRecord.getCostType());
        dto.setAmount(costRecord.getAmount());
        dto.setCurrency(costRecord.getCurrency());
        dto.setCostDate(costRecord.getCostDate());
        dto.setDescription(costRecord.getDescription());
        dto.setVendorName(costRecord.getVendorName());
        dto.setInvoiceNumber(costRecord.getInvoiceNumber());
        dto.setReceiptUrl(costRecord.getReceiptUrl());
        dto.setPaymentStatus(costRecord.getPaymentStatus());
        dto.setCreatedAt(costRecord.getCreatedAt());
        dto.setUpdatedAt(costRecord.getUpdatedAt());

        return dto;
    }
}