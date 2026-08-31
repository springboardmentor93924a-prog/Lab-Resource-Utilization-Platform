package com.example.lab_platform.repository;

import com.example.lab_platform.entity.WorkOrder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Integer> {

    List<WorkOrder> findByEquipment_EquipmentId(Integer equipmentId);
}