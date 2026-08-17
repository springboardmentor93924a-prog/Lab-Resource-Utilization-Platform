package com.labplatform.maintenance.controller;

import com.labplatform.maintenance.dto.WorkOrderAssignRequest;
import com.labplatform.maintenance.dto.WorkOrderCreateRequest;
import com.labplatform.maintenance.dto.WorkOrderCompleteRequest;
import com.labplatform.maintenance.dto.WorkOrderResponse;
import com.labplatform.maintenance.service.WorkOrderService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    public WorkOrderController(
            WorkOrderService workOrderService) {

        this.workOrderService = workOrderService;
    }

    @PostMapping
    public ResponseEntity<WorkOrderResponse> createWorkOrder(
            @Valid @RequestBody WorkOrderCreateRequest request,
            Authentication authentication) {

        WorkOrderResponse response =
                workOrderService.createWorkOrder(
                        request,
                        authentication.getName());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<WorkOrderResponse>> getAllWorkOrders() {

        return ResponseEntity.ok(
                workOrderService.getAllWorkOrders());
    }

    @GetMapping("/my")
    public ResponseEntity<List<WorkOrderResponse>>
    getMyAssignedWorkOrders(
            Authentication authentication) {

        return ResponseEntity.ok(
                workOrderService
                        .getMyAssignedWorkOrders(
                                authentication.getName()));
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<List<WorkOrderResponse>>
    getWorkOrdersByEquipment(
            @PathVariable Long equipmentId) {

        return ResponseEntity.ok(
                workOrderService
                        .getWorkOrdersByEquipment(
                                equipmentId));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<WorkOrderResponse>
    assignTechnician(
            @PathVariable Integer id,
            @Valid @RequestBody WorkOrderAssignRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                workOrderService.assignTechnician(
                        id,
                        request,
                        authentication.getName()));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<WorkOrderResponse>
    markComplete(
            @PathVariable Integer id,
            @Valid @RequestBody WorkOrderCompleteRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                workOrderService.markComplete(
                        id,
                        request,
                        authentication.getName()));
    }
}