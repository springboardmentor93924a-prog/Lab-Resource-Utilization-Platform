package com.example.lab_platform.repository;

import com.example.lab_platform.entity.EquipmentDowntime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentDowntimeRepository extends JpaRepository<EquipmentDowntime, Integer> {

    List<EquipmentDowntime> findByEquipment_EquipmentId(Integer equipmentId);
}