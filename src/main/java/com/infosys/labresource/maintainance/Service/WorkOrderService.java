package com.infosys.labresource.maintainance.Service;

import com.infosys.labresource.maintainance.Entities.WorkOrder;

import java.util.List;

public interface WorkOrderService {
    WorkOrder createWorkOrder(Long scheduleId, String description);

    WorkOrder assignTechnician(Long workOrderId, Long technicianId);

    WorkOrder startWork(Long workOrderId);

    WorkOrder completeWork(Long workOrderId);

    WorkOrder getWorkOrder(Long workOrderId);

    List<WorkOrder> getTechnicianWorkOrders(Long technicianId);
}
