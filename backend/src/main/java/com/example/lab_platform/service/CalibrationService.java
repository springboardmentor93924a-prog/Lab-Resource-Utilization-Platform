package com.example.lab_platform.service;

import com.example.lab_platform.entity.EquipmentCalibration;

import java.util.List;

public interface CalibrationService {

    List<EquipmentCalibration> getAllCalibrations();

    EquipmentCalibration getCalibrationById(Integer id);

    List<EquipmentCalibration> getCalibrationsByEquipment(Integer equipmentId);

    EquipmentCalibration createCalibration(EquipmentCalibration calibration);

    EquipmentCalibration updateCalibration(Integer id, EquipmentCalibration updated);

    // Reminder queries — equipment due within N days, and equipment already overdue
    List<EquipmentCalibration> getDueSoon(int withinDays);

    List<EquipmentCalibration> getOverdue();

    List<EquipmentCalibration> getCertificationExpiringSoon(int withinDays);
    
    List<EquipmentCalibration> getCertificationExpired();
}