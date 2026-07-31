package com.example.lab_platform.repository;

import com.example.lab_platform.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByCategoryId(Long categoryId);
    List<Equipment> findByLocationId(Long locationId);
}