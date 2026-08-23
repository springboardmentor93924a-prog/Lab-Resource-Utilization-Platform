package com.labresource.backend.certification.repository;

import com.labresource.backend.certification.entity.EquipmentCertification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentCertificationRepository extends JpaRepository<EquipmentCertification, Long> {
    List<EquipmentCertification> findByEquipmentId(Long equipmentId);
    List<EquipmentCertification> findByEquipmentIdAndStatus(Long equipmentId, String status);
    List<EquipmentCertification> findByStatus(String status);
    List<EquipmentCertification> findByEquipmentIdIn(List<Long> equipmentIds);
}


