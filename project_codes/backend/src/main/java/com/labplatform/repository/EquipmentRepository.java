package com.labplatform.repository;

import com.labplatform.entity.Equipment;
import com.labplatform.entity.EquipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByInstitutionId(Long institutionId);
    List<Equipment> findByStatus(EquipmentStatus status);
    List<Equipment> findBySharableAcrossInstitutionsTrue();
    List<Equipment> findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(String name, String category);
    List<Equipment> findByNextCalibrationDueBefore(java.time.LocalDate date);
}
