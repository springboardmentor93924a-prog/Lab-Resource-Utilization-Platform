package com.infosys.labresource.Equipment.services;

import com.infosys.labresource.Equipment.Repository.CalibrationRecordRepository;
import com.infosys.labresource.Equipment.Repository.EquipmentRepository;
import com.infosys.labresource.Equipment.dtos.CalibRecordRequestDTO;
import com.infosys.labresource.Equipment.entity.CalibrationRecord;
import com.infosys.labresource.Equipment.entity.CertificationStatus;
import com.infosys.labresource.Equipment.entity.Equipment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CalibRecordServiceImpl implements CalibrationRecordService{
    private final CalibrationRecordRepository calibrationRecordRepository;
    private final EquipmentRepository equipmentRepository;

    @Override
    public CalibrationRecord createCalibrationRecord(CalibRecordRequestDTO requestDTO) {

        Equipment equipment = equipmentRepository.findById(requestDTO.getEquipmentId()).orElseThrow(() ->
                        new RuntimeException("Equipment not found"));

        if (calibrationRecordRepository.existsByEquipment(equipment)) {
            throw new RuntimeException(
                    "Calibration record already exists for this equipment");
        }

        validateDates(requestDTO);
        CalibrationRecord record = new CalibrationRecord();

        record.setEquipment(equipment);
        record.setLastCalibrationDate(requestDTO.getLastCalibrationDate());
        record.setNextCalibrationDate(requestDTO.getNextCalibrationDate());
        record.setCalibrationIntervalMonths(requestDTO.getCalibrationIntervalMonths());

        record.setCertificationNumber(requestDTO.getCertificationNumber());

        record.setCertificationIssueDate(requestDTO.getCertificationIssueDate());

        record.setCertificationExpiryDate(requestDTO.getCertificationExpiryDate());

        record.setCertificationStatus(determineCertificationStatus(requestDTO));

        return calibrationRecordRepository.save(record);
    }

    @Override
    public CalibrationRecord getCalibrationRecordByEquipmentId(Long equipmentId) {

        Equipment equipment = equipmentRepository.findById(equipmentId).orElseThrow(() -> new RuntimeException("Equipment not found"));

        return calibrationRecordRepository.findByEquipment(equipment).orElseThrow(() -> new RuntimeException("Calibration record not found for equipment"));
    }

    @Override
    public CalibrationRecord updateCalibrationRecord(Long calibrationId, CalibRecordRequestDTO requestDTO) {

        CalibrationRecord record = calibrationRecordRepository.findById(calibrationId).orElseThrow(() -> new RuntimeException("Calibration record not found"));

        validateDates(requestDTO);

        record.setLastCalibrationDate(requestDTO.getLastCalibrationDate());

        record.setNextCalibrationDate(requestDTO.getNextCalibrationDate());

        record.setCalibrationIntervalMonths(requestDTO.getCalibrationIntervalMonths());

        record.setCertificationNumber(requestDTO.getCertificationNumber());

        record.setCertificationIssueDate(requestDTO.getCertificationIssueDate());

        record.setCertificationExpiryDate(requestDTO.getCertificationExpiryDate());

        record.setCertificationStatus(determineCertificationStatus(requestDTO));

        return calibrationRecordRepository.save(record);
    }

    @Override
    public void deleteCalibrationRecord(Long calibrationId) {

        CalibrationRecord record = calibrationRecordRepository.findById(calibrationId).orElseThrow(() -> new RuntimeException("Calibration record not found"));

        calibrationRecordRepository.delete(record);
    }

    private void validateDates(
            CalibRecordRequestDTO requestDTO) {

        if (requestDTO.getLastCalibrationDate() != null &&
                requestDTO.getNextCalibrationDate() != null &&
                requestDTO.getNextCalibrationDate()
                        .isBefore(requestDTO.getLastCalibrationDate())) {

            throw new RuntimeException("Next calibration date cannot be before last calibration date");
        }

        if (requestDTO.getCertificationIssueDate() != null &&
                requestDTO.getCertificationExpiryDate() != null &&
                requestDTO.getCertificationExpiryDate()
                        .isBefore(requestDTO.getCertificationIssueDate())) {

            throw new RuntimeException("Certification expiry date cannot be before issue date");
        }
    }

    private CertificationStatus determineCertificationStatus(CalibRecordRequestDTO requestDTO) {

        if (!Boolean.TRUE.equals(requestDTO.getCertificationRequired())) {

            return CertificationStatus.NOT_CERTIFIED;
        }

        if (requestDTO.getCertificationExpiryDate() == null) {
            throw new RuntimeException("Certification expiry date is required");
        }

        if (requestDTO.getCertificationExpiryDate().isBefore(LocalDate.now())) {

            return CertificationStatus.EXPIRED;
        }

        return CertificationStatus.ACTIVE;
    }
}
