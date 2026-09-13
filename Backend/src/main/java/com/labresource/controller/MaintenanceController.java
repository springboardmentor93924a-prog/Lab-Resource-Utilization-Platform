package com.labresource.controller;

import com.labresource.entity.MaintenancePriority;
import com.labresource.entity.MaintenanceRequest;
import com.labresource.entity.MaintenanceRequestStatus;
import com.labresource.entity.WorkOrder;
import com.labresource.entity.WorkOrderStatus;
import com.labresource.service.MaintenanceService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(
            MaintenanceService maintenanceService) {

        this.maintenanceService = maintenanceService;
    }


    // =========================================================
    // 1. CREATE MAINTENANCE REQUEST
    //
    // Any authenticated role can report an equipment problem.
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'RESEARCHER',
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'DEPARTMENT_HEAD',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @PostMapping("/requests")
    public ResponseEntity<?> createMaintenanceRequest(
            @RequestParam Long equipmentId,
            @RequestParam String description,
            @RequestParam(required = false)
            MaintenancePriority priority,
            @RequestParam(required = false)
            String notes,
            Authentication authentication) {

        try {

            MaintenanceRequest request =
                    maintenanceService.createMaintenanceRequest(
                            equipmentId,
                            description,
                            priority,
                            notes,
                            authentication
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(request);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 2. GET ALL MAINTENANCE REQUESTS
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/requests")
    public ResponseEntity<?> getAllMaintenanceRequests() {

        try {

            List<MaintenanceRequest> requests =
                    maintenanceService
                            .getAllMaintenanceRequests();

            return ResponseEntity.ok(requests);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 3. GET MAINTENANCE REQUEST BY ID
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/requests/{id}")
    public ResponseEntity<?> getMaintenanceRequestById(
            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    maintenanceService
                            .getMaintenanceRequestById(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 4. GET REQUESTS BY STATUS
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/requests/status/{status}")
    public ResponseEntity<?> getRequestsByStatus(
            @PathVariable MaintenanceRequestStatus status) {

        try {

            return ResponseEntity.ok(
                    maintenanceService
                            .getMaintenanceRequestsByStatus(
                                    status
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 5. GET REQUESTS BY EQUIPMENT
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/requests/equipment/{equipmentId}")
    public ResponseEntity<?> getRequestsByEquipment(
            @PathVariable Long equipmentId) {

        try {

            return ResponseEntity.ok(
                    maintenanceService
                            .getMaintenanceRequestsByEquipment(
                                    equipmentId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 6. UPDATE MAINTENANCE REQUEST STATUS
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @PutMapping("/requests/{id}/status")
    public ResponseEntity<?> updateMaintenanceRequestStatus(
            @PathVariable Long id,
            @RequestParam MaintenanceRequestStatus status) {

        try {

            return ResponseEntity.ok(
                    maintenanceService
                            .updateMaintenanceRequestStatus(
                                    id,
                                    status
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 7. CREATE WORK ORDER
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @PostMapping("/work-orders")
    public ResponseEntity<?> createWorkOrder(
            @RequestParam Long maintenanceRequestId,
            @RequestParam(required = false)
            String workDescription,
            @RequestParam(required = false)
            String scheduledStart,
            @RequestParam(required = false)
            String scheduledEnd) {

        try {

            LocalDateTime start = null;
            LocalDateTime end = null;

            if (scheduledStart != null &&
                    !scheduledStart.isBlank()) {

                start =
                        LocalDateTime.parse(
                                scheduledStart
                        );
            }

            if (scheduledEnd != null &&
                    !scheduledEnd.isBlank()) {

                end =
                        LocalDateTime.parse(
                                scheduledEnd
                        );
            }

            WorkOrder workOrder =
                    maintenanceService.createWorkOrder(
                            maintenanceRequestId,
                            workDescription,
                            start,
                            end
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(workOrder);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 8. GET ALL WORK ORDERS
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/work-orders")
    public ResponseEntity<?> getAllWorkOrders() {

        try {

            return ResponseEntity.ok(
                    maintenanceService.getAllWorkOrders()
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 9. GET WORK ORDER BY ID
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/work-orders/{id}")
    public ResponseEntity<?> getWorkOrderById(
            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    maintenanceService
                            .getWorkOrderById(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 10. GET WORK ORDERS BY STATUS
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/work-orders/status/{status}")
    public ResponseEntity<?> getWorkOrdersByStatus(
            @PathVariable WorkOrderStatus status) {

        try {

            return ResponseEntity.ok(
                    maintenanceService
                            .getWorkOrdersByStatus(status)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 11. GET WORK ORDERS BY TECHNICIAN
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/work-orders/technician/{technicianId}")
    public ResponseEntity<?> getWorkOrdersByTechnician(
            @PathVariable Long technicianId) {

        try {

            return ResponseEntity.ok(
                    maintenanceService
                            .getWorkOrdersByTechnician(
                                    technicianId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 12. ASSIGN TECHNICIAN
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @PutMapping("/work-orders/{id}/assign/{technicianId}")
    public ResponseEntity<?> assignTechnician(
            @PathVariable Long id,
            @PathVariable Long technicianId) {

        try {

            return ResponseEntity.ok(
                    maintenanceService.assignTechnician(
                            id,
                            technicianId
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 13. UPDATE WORK ORDER STATUS
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @PutMapping("/work-orders/{id}/status")
    public ResponseEntity<?> updateWorkOrderStatus(
            @PathVariable Long id,
            @RequestParam WorkOrderStatus status) {

        try {

            return ResponseEntity.ok(
                    maintenanceService
                            .updateWorkOrderStatus(
                                    id,
                                    status
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 14. START WORK ORDER
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @PutMapping("/work-orders/{id}/start")
    public ResponseEntity<?> startWorkOrder(
            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    maintenanceService
                            .startWorkOrder(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 15. COMPLETE WORK ORDER
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @PutMapping("/work-orders/{id}/complete")
    public ResponseEntity<?> completeWorkOrder(
            @PathVariable Long id,
            @RequestParam(required = false)
            String completionNotes) {

        try {

            return ResponseEntity.ok(
                    maintenanceService.completeWorkOrder(
                            id,
                            completionNotes
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // 16. CALCULATE DOWNTIME
    // =========================================================

    @PreAuthorize("""
            hasAnyRole(
                'LAB_TECHNICIAN',
                'LAB_MANAGER',
                'INSTITUTION_ADMIN',
                'SYSTEM_ADMIN'
            )
            """)
    @GetMapping("/work-orders/{id}/downtime")
    public ResponseEntity<?> calculateDowntime(
            @PathVariable Long id) {

        try {

            WorkOrder workOrder =
                    maintenanceService
                            .calculateDowntime(id);

            return ResponseEntity.ok(workOrder);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}