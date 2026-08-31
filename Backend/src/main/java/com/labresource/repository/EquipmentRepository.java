package com.labresource.repository;

import com.labresource.entity.Equipment;
import com.labresource.entity.EquipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByStatus(EquipmentStatus status);

    List<Equipment> findByCategoryIgnoreCase(String category);

    List<Equipment> findByNameContainingIgnoreCase(String name);

    boolean existsByAssetTag(String assetTag);
}