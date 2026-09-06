package com.example.demo.repository;

import com.example.demo.entity.Utilization;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UtilizationRepository extends JpaRepository<Utilization, Integer> {
    List<Utilization> findByEquipment_EquipmentId(Integer equipmentId);
}
