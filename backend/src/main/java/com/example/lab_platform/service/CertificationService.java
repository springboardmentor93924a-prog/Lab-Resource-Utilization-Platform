package com.example.lab_platform.service;

import com.example.lab_platform.entity.EquipmentCertification;

import java.util.List;

public interface CertificationService {

    List<EquipmentCertification> getAllCertifications();

    EquipmentCertification getCertificationById(Integer id);

    List<EquipmentCertification> getCertificationsByEquipment(Integer equipmentId);

    EquipmentCertification createCertification(EquipmentCertification certification);

    EquipmentCertification updateCertification(Integer id, EquipmentCertification updated);

    List<EquipmentCertification> getExpiringSoon(int withinDays);

    List<EquipmentCertification> getExpired();
}