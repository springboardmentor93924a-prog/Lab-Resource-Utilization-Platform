package com.example.lab_platform.repository;

import com.example.lab_platform.entity.WorkOrder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Integer> {

    List<WorkOrder> findByAssignedTo_UserId(Integer userId);

    List<WorkOrder> findByEquipment_EquipmentId(Integer equipmentId);

    List<WorkOrder> findByWorkOrderStatus(String workOrderStatus);

    List<WorkOrder> findByMaintenanceRequest_RequestId(Integer requestId);
}
