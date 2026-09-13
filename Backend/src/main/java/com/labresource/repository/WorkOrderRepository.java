
package com.labresource.repository;

import com.labresource.entity.WorkOrder;
import com.labresource.entity.WorkOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkOrderRepository
        extends JpaRepository<WorkOrder, Long> {

    // Find work orders by status
    List<WorkOrder> findByStatus(
            WorkOrderStatus status
    );

    // Find work orders for a particular maintenance request
    List<WorkOrder> findByMaintenanceRequestId(
            Long maintenanceRequestId
    );

    // Find work orders for particular equipment
    List<WorkOrder> findByEquipmentId(
            Long equipmentId
    );

    // Find work orders assigned to a technician
    List<WorkOrder> findByTechnicianId(
            Long technicianId
    );

    // Find all work orders ordered newest first
    List<WorkOrder> findAllByOrderByIdDesc();

    // Find work orders for equipment ordered newest first
    List<WorkOrder> findByEquipmentIdOrderByIdDesc(
            Long equipmentId
    );

    // Find technician's work orders ordered newest first
    List<WorkOrder> findByTechnicianIdOrderByIdDesc(
            Long technicianId
    );
}
