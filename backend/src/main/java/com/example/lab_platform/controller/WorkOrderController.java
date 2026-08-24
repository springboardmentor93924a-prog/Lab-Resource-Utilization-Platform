package com.example.lab_platform.controller;

import com.example.lab_platform.dto.WorkOrderDTO;
import com.example.lab_platform.entity.WorkOrder;
import com.example.lab_platform.service.WorkOrderService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/work-orders")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    public WorkOrderController(WorkOrderService workOrderService) {
        this.workOrderService = workOrderService;
    }

    // All work orders (technicians/managers/admins).
    @GetMapping
    public List<WorkOrderDTO> getAllWorkOrders() {
        return workOrderService.getAllWorkOrders()
                .stream()
                .map(WorkOrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Work orders assigned to the currently logged-in technician —
    // powers the Lab Technician "My Work Orders" view.
    @GetMapping("/my-work-orders")
    public ResponseEntity<List<WorkOrderDTO>> getMyWorkOrders() {
        List<WorkOrderDTO> workOrders = workOrderService.getMyWorkOrders()
                .stream()
                .map(WorkOrderDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(workOrders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkOrderDTO> getWorkOrderById(@PathVariable Integer id) {
        return ResponseEntity.ok(WorkOrderDTO.fromEntity(workOrderService.getWorkOrderById(id)));
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<WorkOrderDTO>> getWorkOrdersForEquipment(@PathVariable Integer equipmentId) {
        List<WorkOrderDTO> workOrders = workOrderService.getWorkOrdersForEquipment(equipmentId)
                .stream()
                .map(WorkOrderDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(workOrders);
    }

    // Manually raise a work order (equipment + description), not tied
    // to an existing maintenance request.
    @PostMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<WorkOrderDTO> createWorkOrder(@RequestBody WorkOrder workOrder) {
        return ResponseEntity.ok(WorkOrderDTO.fromEntity(workOrderService.createWorkOrder(workOrder)));
    }

    // Convert an approved maintenance request into an executable work
    // order (equipment is pulled from the request automatically).
    @PostMapping("/from-request/{requestId}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<WorkOrderDTO> createFromRequest(
            @PathVariable Integer requestId,
            @RequestBody(required = false) WorkOrder workOrder) {

        return ResponseEntity.ok(
                WorkOrderDTO.fromEntity(
                        workOrderService.createWorkOrderFromRequest(requestId, workOrder)
                )
        );
    }

    // Update status / schedule / priority / description / notes, and
    // (optionally) reassign in the same call.
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<WorkOrderDTO> updateWorkOrder(
            @PathVariable Integer id,
            @RequestBody WorkOrder workOrder) {

        return ResponseEntity.ok(WorkOrderDTO.fromEntity(workOrderService.updateWorkOrder(id, workOrder)));
    }

    // Dedicated "assign to technician" action — body: { "technicianId": 5 }
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<WorkOrderDTO> assignTechnician(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> body) {

        Integer technicianId = body.get("technicianId");
        return ResponseEntity.ok(WorkOrderDTO.fromEntity(workOrderService.assignTechnician(id, technicianId)));
    }
}
