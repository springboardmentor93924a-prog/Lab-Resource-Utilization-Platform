package com.example.lab_platform.repository;

import com.example.lab_platform.entity.EquipmentCertification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CertificationRepository
        extends JpaRepository<EquipmentCertification, Integer> {

    List<EquipmentCertification> findByEquipment_EquipmentId(Integer equipmentId);

    List<EquipmentCertification> findByCertificationStatus(String certificationStatus);

    // Expired: expiry date has already passed
    List<EquipmentCertification> findByExpiryDateLessThanEqual(LocalDate date);

    // Expiring soon: expiry date falls within the given window
    List<EquipmentCertification> findByExpiryDateBetween(LocalDate start, LocalDate end);
}