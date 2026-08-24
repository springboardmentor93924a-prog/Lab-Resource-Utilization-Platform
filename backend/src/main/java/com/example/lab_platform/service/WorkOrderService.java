package com.example.lab_platform.service;

import com.example.lab_platform.entity.WorkOrder;

import java.util.List;

public interface WorkOrderService {

    List<WorkOrder> getAllWorkOrders();

    WorkOrder getWorkOrderById(Integer id);

    // Manually raised work order (equipment + description supplied
    // directly, not necessarily tied to a maintenance request).
    WorkOrder createWorkOrder(WorkOrder workOrder);

    // Converts an approved MaintenanceRequest into an executable work
    // order — pulls equipment straight from the request so the
    // technician doesn't re-enter it.
    WorkOrder createWorkOrderFromRequest(Integer requestId, WorkOrder workOrder);

    WorkOrder updateWorkOrder(Integer id, WorkOrder updatedWorkOrder);

    WorkOrder assignTechnician(Integer id, Integer technicianId);

    // Work orders assigned to the currently logged-in technician.
    List<WorkOrder> getMyWorkOrders();

    List<WorkOrder> getWorkOrdersForEquipment(Integer equipmentId);
}
