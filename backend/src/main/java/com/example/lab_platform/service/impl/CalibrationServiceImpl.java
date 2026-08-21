package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.EquipmentCalibration;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.CalibrationRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.service.CalibrationService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CalibrationServiceImpl implements CalibrationService {

    private final CalibrationRepository calibrationRepository;
    private final EquipmentRepository equipmentRepository;

    public CalibrationServiceImpl(
            CalibrationRepository calibrationRepository,
            EquipmentRepository equipmentRepository) {
        this.calibrationRepository = calibrationRepository;
        this.equipmentRepository = equipmentRepository;
    }

    private User getLoggedInUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    @Override
    public List<EquipmentCalibration> getAllCalibrations() {
        return calibrationRepository.findAll();
    }

    @Override
    public EquipmentCalibration getCalibrationById(Integer id) {
        return calibrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Calibration record not found"));
    }

    @Override
    public List<EquipmentCalibration> getCalibrationsByEquipment(Integer equipmentId) {
        return calibrationRepository.findByEquipment_EquipmentId(equipmentId);
    }

    @Override
    public EquipmentCalibration createCalibration(EquipmentCalibration calibration) {
        if (calibration.getEquipment() == null || calibration.getEquipment().getEquipmentId() == null) {
            throw new RuntimeException("Equipment is required");
        }
        if (calibration.getCalibrationDate() == null) {
            throw new RuntimeException("Calibration date is required");
        }
        if (calibration.getNextCalibrationDate() == null) {
            throw new RuntimeException("Next calibration date is required");
        }
        if (!calibration.getNextCalibrationDate().isAfter(calibration.getCalibrationDate())) {
            throw new RuntimeException("Next calibration date must be after the calibration date");
        }

        Equipment equipment = equipmentRepository.findById(calibration.getEquipment().getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        // calibratedBy is derived from the logged-in technician, never trusted
        // from the request body — same reasoning as receiverInstitution in
        // ResourceSharingServiceImpl.
        User loggedInUser = getLoggedInUser();

        calibration.setEquipment(equipment);
        calibration.setCalibratedBy(loggedInUser.getFullName());

        if (calibration.getCalibrationStatus() == null || calibration.getCalibrationStatus().isBlank()) {
            calibration.setCalibrationStatus("COMPLETED");
        }

        return calibrationRepository.save(calibration);
    }

    @Override
    public EquipmentCalibration updateCalibration(Integer id, EquipmentCalibration updated) {
        EquipmentCalibration existing = calibrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Calibration record not found"));

        if (updated.getCalibrationDate() != null) {
            existing.setCalibrationDate(updated.getCalibrationDate());
        }
        if (updated.getNextCalibrationDate() != null) {
            existing.setNextCalibrationDate(updated.getNextCalibrationDate());
        }
        if (updated.getCalibrationStatus() != null) {
            existing.setCalibrationStatus(updated.getCalibrationStatus());
        }
        if (updated.getCertificateNumber() != null) {
            existing.setCertificateNumber(updated.getCertificateNumber());
        }
        if (updated.getRemarks() != null) {
            existing.setRemarks(updated.getRemarks());
        }

        return calibrationRepository.save(existing);
    }

    @Override
    public List<EquipmentCalibration> getDueSoon(int withinDays) {
        LocalDate today = LocalDate.now();
        return calibrationRepository.findByNextCalibrationDateBetween(
                today, today.plusDays(withinDays)
        );
    }

    @Override
    public List<EquipmentCalibration> getOverdue() {
        return calibrationRepository.findByNextCalibrationDateLessThanEqual(LocalDate.now());
    }
}