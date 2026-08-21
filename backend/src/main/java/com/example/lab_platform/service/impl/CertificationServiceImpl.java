package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.EquipmentCertification;
import com.example.lab_platform.repository.CertificationRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.service.CertificationService;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CertificationServiceImpl implements CertificationService {

    private final CertificationRepository certificationRepository;
    private final EquipmentRepository equipmentRepository;

    public CertificationServiceImpl(
            CertificationRepository certificationRepository,
            EquipmentRepository equipmentRepository) {
        this.certificationRepository = certificationRepository;
        this.equipmentRepository = equipmentRepository;
    }

    @Override
    public List<EquipmentCertification> getAllCertifications() {
        return certificationRepository.findAll();
    }

    @Override
    public EquipmentCertification getCertificationById(Integer id) {
        return certificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certification not found"));
    }

    @Override
    public List<EquipmentCertification> getCertificationsByEquipment(Integer equipmentId) {
        return certificationRepository.findByEquipment_EquipmentId(equipmentId);
    }

    @Override
    public EquipmentCertification createCertification(EquipmentCertification certification) {
        if (certification.getEquipment() == null || certification.getEquipment().getEquipmentId() == null) {
            throw new RuntimeException("Equipment is required");
        }
        if (certification.getCertificationName() == null || certification.getCertificationName().isBlank()) {
            throw new RuntimeException("Certification name is required");
        }
        if (certification.getExpiryDate() == null) {
            throw new RuntimeException("Expiry date is required");
        }

        Equipment equipment = equipmentRepository.findById(certification.getEquipment().getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        certification.setEquipment(equipment);

        if (certification.getCertificationStatus() == null || certification.getCertificationStatus().isBlank()) {
            certification.setCertificationStatus("ACTIVE");
        }

        return certificationRepository.save(certification);
    }

    @Override
    public EquipmentCertification updateCertification(Integer id, EquipmentCertification updated) {
        EquipmentCertification existing = certificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certification not found"));

        if (updated.getCertificationName() != null) {
            existing.setCertificationName(updated.getCertificationName());
        }
        if (updated.getCertificateNumber() != null) {
            existing.setCertificateNumber(updated.getCertificateNumber());
        }
        if (updated.getIssuedDate() != null) {
            existing.setIssuedDate(updated.getIssuedDate());
        }
        if (updated.getExpiryDate() != null) {
            existing.setExpiryDate(updated.getExpiryDate());
        }
        if (updated.getIssuingAuthority() != null) {
            existing.setIssuingAuthority(updated.getIssuingAuthority());
        }
        if (updated.getCertificationStatus() != null) {
            existing.setCertificationStatus(updated.getCertificationStatus());
        }
        if (updated.getRemarks() != null) {
            existing.setRemarks(updated.getRemarks());
        }

        return certificationRepository.save(existing);
    }

    @Override
    public List<EquipmentCertification> getExpiringSoon(int withinDays) {
        LocalDate today = LocalDate.now();
        return certificationRepository.findByExpiryDateBetween(
                today, today.plusDays(withinDays)
        );
    }

    @Override
    public List<EquipmentCertification> getExpired() {
        return certificationRepository.findByExpiryDateLessThanEqual(LocalDate.now());
    }
}