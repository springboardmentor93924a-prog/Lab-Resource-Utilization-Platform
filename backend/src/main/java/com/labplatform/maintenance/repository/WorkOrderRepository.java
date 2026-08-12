package com.labplatform.maintenance.repository;

import com.labplatform.maintenance.model.WorkOrder;
import com.labplatform.maintenance.model.WorkOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Integer> {

    List<WorkOrder> findByEquipmentId(Long equipmentId);

    List<WorkOrder> findByAssignedToId(UUID userId);

    List<WorkOrder> findByStatus(WorkOrderStatus status);
}