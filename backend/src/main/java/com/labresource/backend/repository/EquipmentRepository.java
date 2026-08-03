package com.labresource.backend.repository;

import com.labresource.backend.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipmentRepository
        extends JpaRepository<Equipment,Integer> {
}