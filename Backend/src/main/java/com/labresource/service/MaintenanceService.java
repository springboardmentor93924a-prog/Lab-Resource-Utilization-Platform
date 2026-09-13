
package com.labresource.service;

import com.labresource.entity.MaintenancePriority;
import com.labresource.entity.MaintenanceRequest;
import com.labresource.entity.MaintenanceRequestStatus;
import com.labresource.entity.WorkOrder;
import com.labresource.entity.WorkOrderStatus;

import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;

public interface MaintenanceService {

    // ============================================================
    // MAINTENANCE REQUESTS
    // ============================================================

    MaintenanceRequest createMaintenanceRequest(
            Long equipmentId,
            String description,
            MaintenancePriority priority,
            String notes,
            Authentication authentication
    );

    List<MaintenanceRequest> getAllMaintenanceRequests();

    MaintenanceRequest getMaintenanceRequestById(Long id);

    List<MaintenanceRequest> getMaintenanceRequestsByStatus(
            MaintenanceRequestStatus status
    );

    List<MaintenanceRequest> getMaintenanceRequestsByEquipment(
            Long equipmentId
    );

    MaintenanceRequest updateMaintenanceRequestStatus(
            Long id,
            MaintenanceRequestStatus status
    );

    // ============================================================
    // WORK ORDERS
    // ============================================================

    WorkOrder createWorkOrder(
            Long maintenanceRequestId,
            String workDescription,
            LocalDateTime scheduledStart,
            LocalDateTime scheduledEnd
    );

    List<WorkOrder> getAllWorkOrders();

    WorkOrder getWorkOrderById(Long id);

    List<WorkOrder> getWorkOrdersByStatus(
            WorkOrderStatus status
    );

    List<WorkOrder> getWorkOrdersByTechnician(
            Long technicianId
    );

    WorkOrder assignTechnician(
            Long workOrderId,
            Long technicianId
    );

    WorkOrder updateWorkOrderStatus(
            Long id,
            WorkOrderStatus status
    );

    WorkOrder startWorkOrder(
            Long id
    );

    WorkOrder completeWorkOrder(
            Long id,
            String completionNotes
    );

    // ============================================================
    // DOWNTIME
    // ============================================================

    WorkOrder calculateDowntime(
            Long id
    );
}
