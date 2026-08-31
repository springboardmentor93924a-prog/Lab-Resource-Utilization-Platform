package com.infosys.labresource.maintainance.Controller;


import com.infosys.labresource.maintainance.Entities.WorkOrder;
import com.infosys.labresource.maintainance.Service.WorkOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {
    private final WorkOrderService workOrderService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('LAB_MANAGER')")
    public ResponseEntity<WorkOrder> createWorkOrder(@RequestParam Long scheduleId, @RequestParam String description) {

        WorkOrder order = workOrderService.createWorkOrder(scheduleId, description);

        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }
    @PutMapping("/assign/{workOrderId}/{technicianId}")
    @PreAuthorize("hasRole('LAB_MANAGER')")
    public ResponseEntity<WorkOrder> assignTechnician(@PathVariable Long workOrderId, @PathVariable Long technicianId) {

        return ResponseEntity.ok(
                workOrderService.assignTechnician(workOrderId, technicianId));
    }

    @PutMapping("/start/{workOrderId}")
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public ResponseEntity<WorkOrder> startWork(@PathVariable Long workOrderId) {

        return ResponseEntity.ok(workOrderService.startWork(workOrderId));
    }

    @PutMapping("/complete/{workOrderId}")
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public ResponseEntity<WorkOrder> completeWork(@PathVariable Long workOrderId) {

        return ResponseEntity.ok(workOrderService.completeWork(workOrderId));
    }
    @GetMapping("/{workOrderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<WorkOrder> getWorkOrder(@PathVariable Long workOrderId) {

        return ResponseEntity.ok(workOrderService.getWorkOrder(workOrderId));
    }

    @GetMapping("/technician/{technicianId}")
    @PreAuthorize("hasAnyRole('LAB_MANAGER','LAB_TECHNICIAN')")
    public ResponseEntity<List<WorkOrder>> getTechnicianWorkOrders(@PathVariable Long technicianId) {

        return ResponseEntity.ok(workOrderService.getTechnicianWorkOrders(technicianId));
    }
}
