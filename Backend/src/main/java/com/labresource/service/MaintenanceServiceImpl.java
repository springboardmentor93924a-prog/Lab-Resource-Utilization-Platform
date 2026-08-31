
package com.labresource.service;

import com.labresource.entity.Equipment;
import com.labresource.entity.EquipmentStatus;
import com.labresource.entity.MaintenancePriority;
import com.labresource.entity.MaintenanceRequest;
import com.labresource.entity.MaintenanceRequestStatus;
import com.labresource.entity.Role;
import com.labresource.entity.User;
import com.labresource.entity.WorkOrder;
import com.labresource.entity.WorkOrderStatus;

import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.MaintenanceRequestRepository;
import com.labresource.repository.UserRepository;
import com.labresource.repository.WorkOrderRepository;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class MaintenanceServiceImpl implements MaintenanceService {

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final WorkOrderRepository workOrderRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    public MaintenanceServiceImpl(
            MaintenanceRequestRepository maintenanceRequestRepository,
            WorkOrderRepository workOrderRepository,
            EquipmentRepository equipmentRepository,
            UserRepository userRepository
    ) {
        this.maintenanceRequestRepository =
                maintenanceRequestRepository;

        this.workOrderRepository =
                workOrderRepository;

        this.equipmentRepository =
                equipmentRepository;

        this.userRepository =
                userRepository;
    }

    // ============================================================
    // 1. CREATE MAINTENANCE REQUEST
    // ============================================================

    @Override
    public MaintenanceRequest createMaintenanceRequest(
            Long equipmentId,
            String description,
            MaintenancePriority priority,
            String notes,
            Authentication authentication
    ) {

        if (equipmentId == null) {
            throw new IllegalArgumentException(
                    "Equipment ID is required."
            );
        }

        if (description == null ||
                description.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Maintenance description is required."
            );
        }

        if (authentication == null ||
                authentication.getName() == null) {

            throw new IllegalArgumentException(
                    "Authenticated user is required."
            );
        }

        // Find equipment
        Equipment equipment =
                equipmentRepository.findById(equipmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Equipment not found with id: "
                                                + equipmentId
                                )
                        );

        /*
         * authentication.getName() normally contains
         * the logged-in user's email.
         */
        User requestedBy =
                userRepository.findByEmail(
                        authentication.getName()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Authenticated user not found: "
                                        + authentication.getName()
                        )
                );

        MaintenanceRequest request =
                new MaintenanceRequest();

        request.setEquipment(equipment);

        request.setRequestedBy(requestedBy);

        request.setDescription(
                description.trim()
        );

        request.setPriority(
                priority == null
                        ? MaintenancePriority.MEDIUM
                        : priority
        );

        request.setNotes(
                notes == null ||
                        notes.trim().isEmpty()
                        ? null
                        : notes.trim()
        );

        request.setStatus(
                MaintenanceRequestStatus.PENDING
        );

        MaintenanceRequest saved =
                maintenanceRequestRepository.save(request);

        /*
         * Put equipment into maintenance state.
         */
        equipment.setStatus(
                EquipmentStatus.UNDER_MAINTENANCE
        );

        equipmentRepository.save(equipment);

        return saved;
    }

    // ============================================================
    // 2. GET ALL MAINTENANCE REQUESTS
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceRequest>
    getAllMaintenanceRequests() {

        return maintenanceRequestRepository
                .findAllByOrderByRequestedAtDesc();
    }

    // ============================================================
    // 3. GET MAINTENANCE REQUEST BY ID
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public MaintenanceRequest
    getMaintenanceRequestById(Long id) {

        return maintenanceRequestRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Maintenance request not found with id: "
                                        + id
                        )
                );
    }

    // ============================================================
    // 4. GET REQUESTS BY STATUS
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceRequest>
    getMaintenanceRequestsByStatus(
            MaintenanceRequestStatus status
    ) {

        return maintenanceRequestRepository
                .findByStatus(status);
    }

    // ============================================================
    // 5. GET REQUESTS BY EQUIPMENT
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceRequest>
    getMaintenanceRequestsByEquipment(
            Long equipmentId
    ) {

        return maintenanceRequestRepository
                .findByEquipmentIdOrderByRequestedAtDesc(
                        equipmentId
                );
    }

    // ============================================================
    // 6. UPDATE MAINTENANCE REQUEST STATUS
    // ============================================================

    @Override
    public MaintenanceRequest
    updateMaintenanceRequestStatus(
            Long id,
            MaintenanceRequestStatus status
    ) {

        if (status == null) {
            throw new IllegalArgumentException(
                    "Maintenance request status is required."
            );
        }

        MaintenanceRequest request =
                getMaintenanceRequestById(id);

        request.setStatus(status);

        Equipment equipment =
                request.getEquipment();

        if (equipment != null) {

            if (status ==
                    MaintenanceRequestStatus.IN_PROGRESS) {

                equipment.setStatus(
                        EquipmentStatus.UNDER_MAINTENANCE
                );
            }

            if (status ==
                    MaintenanceRequestStatus.COMPLETED ||
                    status ==
                    MaintenanceRequestStatus.CANCELLED) {

                equipment.setStatus(
                        EquipmentStatus.AVAILABLE
                );
            }

            equipmentRepository.save(equipment);
        }

        return maintenanceRequestRepository.save(
                request
        );
    }

    // ============================================================
    // 7. CREATE WORK ORDER
    // ============================================================

    @Override
    public WorkOrder createWorkOrder(
            Long maintenanceRequestId,
            String workDescription,
            LocalDateTime scheduledStart,
            LocalDateTime scheduledEnd
    ) {

        if (maintenanceRequestId == null) {
            throw new IllegalArgumentException(
                    "Maintenance request ID is required."
            );
        }

        MaintenanceRequest request =
                getMaintenanceRequestById(
                        maintenanceRequestId
                );

        Equipment equipment =
                request.getEquipment();

        if (workDescription == null ||
                workDescription.trim().isEmpty()) {

            /*
             * Use the maintenance request description
             * if no separate work description was provided.
             */
            workDescription =
                    request.getDescription();
        }

        if (scheduledStart != null &&
                scheduledEnd != null &&
                scheduledEnd.isBefore(scheduledStart)) {

            throw new IllegalArgumentException(
                    "Scheduled end cannot be before scheduled start."
            );
        }

        WorkOrder workOrder =
                new WorkOrder();

        workOrder.setMaintenanceRequest(
                request
        );

        workOrder.setEquipment(
                equipment
        );

        workOrder.setWorkDescription(
                workDescription.trim()
        );

        workOrder.setScheduledStart(
                scheduledStart
        );

        workOrder.setScheduledEnd(
                scheduledEnd
        );

        workOrder.setStatus(
                WorkOrderStatus.CREATED
        );

        if (equipment != null) {

            equipment.setStatus(
                    EquipmentStatus.UNDER_MAINTENANCE
            );

            equipmentRepository.save(equipment);
        }

        /*
         * Once a work order is created,
         * the maintenance request is approved.
         */
        if (request.getStatus() ==
                MaintenanceRequestStatus.PENDING) {

            request.setStatus(
                    MaintenanceRequestStatus.APPROVED
            );

            maintenanceRequestRepository.save(
                    request
            );
        }

        return workOrderRepository.save(
                workOrder
        );
    }

    // ============================================================
    // 8. GET ALL WORK ORDERS
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrder>
    getAllWorkOrders() {

        return workOrderRepository
                .findAllByOrderByIdDesc();
    }

    // ============================================================
    // 9. GET WORK ORDER BY ID
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public WorkOrder
    getWorkOrderById(Long id) {

        return workOrderRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Work order not found with id: "
                                        + id
                        )
                );
    }

    // ============================================================
    // 10. GET WORK ORDERS BY STATUS
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrder>
    getWorkOrdersByStatus(
            WorkOrderStatus status
    ) {

        return workOrderRepository
                .findByStatus(status);
    }

    // ============================================================
    // 11. GET WORK ORDERS BY TECHNICIAN
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<WorkOrder>
    getWorkOrdersByTechnician(
            Long technicianId
    ) {

        return workOrderRepository
                .findByTechnicianIdOrderByIdDesc(
                        technicianId
                );
    }

    // ============================================================
    // 12. ASSIGN TECHNICIAN
    // ============================================================

    @Override
    public WorkOrder assignTechnician(
            Long workOrderId,
            Long technicianId
    ) {

        WorkOrder workOrder =
                getWorkOrderById(
                        workOrderId
                );

        User technician =
                userRepository.findById(
                        technicianId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Technician not found with id: "
                                        + technicianId
                        )
                );

        if (technician.getRole() !=
                Role.LAB_TECHNICIAN) {

            throw new IllegalArgumentException(
                    "Selected user is not a Lab Technician."
            );
        }

        workOrder.setTechnician(
                technician
        );

        if (workOrder.getStatus() ==
                WorkOrderStatus.CREATED) {

            workOrder.setStatus(
                    WorkOrderStatus.ASSIGNED
            );
        }

        return workOrderRepository.save(
                workOrder
        );
    }

    // ============================================================
    // 13. UPDATE WORK ORDER STATUS
    // ============================================================

    @Override
    public WorkOrder updateWorkOrderStatus(
            Long id,
            WorkOrderStatus status
    ) {

        if (status == null) {
            throw new IllegalArgumentException(
                    "Work order status is required."
            );
        }

        WorkOrder workOrder =
                getWorkOrderById(id);

        workOrder.setStatus(status);

        if (status ==
                WorkOrderStatus.IN_PROGRESS) {

            if (workOrder.getActualStart() == null) {

                workOrder.setActualStart(
                        LocalDateTime.now()
                );
            }

            MaintenanceRequest request =
                    workOrder.getMaintenanceRequest();

            if (request != null) {

                request.setStatus(
                        MaintenanceRequestStatus.IN_PROGRESS
                );

                maintenanceRequestRepository.save(
                        request
                );
            }
        }

        if (status ==
                WorkOrderStatus.COMPLETED) {

            if (workOrder.getActualStart() == null) {

                workOrder.setActualStart(
                        LocalDateTime.now()
                );
            }

            workOrder.setActualEnd(
                    LocalDateTime.now()
            );

            MaintenanceRequest request =
                    workOrder.getMaintenanceRequest();

            if (request != null) {

                request.setStatus(
                        MaintenanceRequestStatus.COMPLETED
                );

                maintenanceRequestRepository.save(
                        request
                );
            }

            Equipment equipment =
                    workOrder.getEquipment();

            if (equipment != null) {

                equipment.setStatus(
                        EquipmentStatus.AVAILABLE
                );

                equipmentRepository.save(
                        equipment
                );
            }
        }

        if (status ==
                WorkOrderStatus.CANCELLED) {

            Equipment equipment =
                    workOrder.getEquipment();

            if (equipment != null) {

                equipment.setStatus(
                        EquipmentStatus.AVAILABLE
                );

                equipmentRepository.save(
                        equipment
                );
            }
        }

        return workOrderRepository.save(
                workOrder
        );
    }

    // ============================================================
    // 14. START WORK ORDER
    // ============================================================

    @Override
    public WorkOrder startWorkOrder(
            Long id
    ) {

        WorkOrder workOrder =
                getWorkOrderById(id);

        if (workOrder.getStatus() ==
                WorkOrderStatus.COMPLETED) {

            throw new IllegalStateException(
                    "Completed work order cannot be started."
            );
        }

        if (workOrder.getStatus() ==
                WorkOrderStatus.CANCELLED) {

            throw new IllegalStateException(
                    "Cancelled work order cannot be started."
            );
        }

        workOrder.setActualStart(
                LocalDateTime.now()
        );

        workOrder.setStatus(
                WorkOrderStatus.IN_PROGRESS
        );

        MaintenanceRequest request =
                workOrder.getMaintenanceRequest();

        if (request != null) {

            request.setStatus(
                    MaintenanceRequestStatus.IN_PROGRESS
            );

            maintenanceRequestRepository.save(
                    request
            );
        }

        Equipment equipment =
                workOrder.getEquipment();

        if (equipment != null) {

            equipment.setStatus(
                    EquipmentStatus.UNDER_MAINTENANCE
            );

            equipmentRepository.save(
                    equipment
            );
        }

        return workOrderRepository.save(
                workOrder
        );
    }

    // ============================================================
    // 15. COMPLETE WORK ORDER
    // ============================================================

    @Override
    public WorkOrder completeWorkOrder(
            Long id,
            String completionNotes
    ) {

        WorkOrder workOrder =
                getWorkOrderById(id);

        if (workOrder.getStatus() ==
                WorkOrderStatus.COMPLETED) {

            throw new IllegalStateException(
                    "Work order is already completed."
            );
        }

        if (workOrder.getStatus() ==
                WorkOrderStatus.CANCELLED) {

            throw new IllegalStateException(
                    "Cancelled work order cannot be completed."
            );
        }

        if (workOrder.getActualStart() == null) {

            workOrder.setActualStart(
                    LocalDateTime.now()
            );
        }

        workOrder.setActualEnd(
                LocalDateTime.now()
        );

        workOrder.setCompletionNotes(
                completionNotes == null ||
                        completionNotes.trim().isEmpty()
                        ? null
                        : completionNotes.trim()
        );

        workOrder.setStatus(
                WorkOrderStatus.COMPLETED
        );

        MaintenanceRequest request =
                workOrder.getMaintenanceRequest();

        if (request != null) {

            request.setStatus(
                    MaintenanceRequestStatus.COMPLETED
            );

            maintenanceRequestRepository.save(
                    request
            );
        }

        Equipment equipment =
                workOrder.getEquipment();

        if (equipment != null) {

            equipment.setStatus(
                    EquipmentStatus.AVAILABLE
            );

            equipmentRepository.save(
                    equipment
            );
        }

        return workOrderRepository.save(
                workOrder
        );
    }

    // ============================================================
    // 16. CALCULATE DOWNTIME
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public WorkOrder calculateDowntime(
            Long id
    ) {

        WorkOrder workOrder =
                getWorkOrderById(id);

        /*
         * Downtime is based on actual maintenance duration.
         *
         * actualStart -> actualEnd
         *
         * If work is still running, calculate until now.
         */
        if (workOrder.getActualStart() == null) {

            return workOrder;
        }

        LocalDateTime start =
                workOrder.getActualStart();

        LocalDateTime end =
                workOrder.getActualEnd();

        if (end == null) {

            end = LocalDateTime.now();
        }

        if (end.isBefore(start)) {

            throw new IllegalStateException(
                    "Actual end cannot be before actual start."
            );
        }

        long minutes =
                Duration.between(
                        start,
                        end
                ).toMinutes();

        /*
         * WorkOrder does not currently contain
         * a downtimeHours field.
         *
         * Therefore the calculated value is returned
         * through the response header for this endpoint,
         * while the WorkOrder itself remains unchanged.
         */
        double downtimeHours =
                minutes / 60.0;

        /*
         * Log the calculated downtime.
         */
        System.out.println(
                "Work Order #" +
                        workOrder.getId() +
                        " downtime = " +
                        downtimeHours +
                        " hours"
        );

        return workOrder;
    }

    // ============================================================
    // EQUIPMENT HISTORY
    // ============================================================

//     @Override
//     @Transactional(readOnly = true)
//     public List<MaintenanceRequest>
//     getEquipmentMaintenanceHistory(
//             Long equipmentId
//     ) {

//         return maintenanceRequestRepository
//                 .findByEquipmentIdOrderByRequestedAtDesc(
//                         equipmentId
//                 );
//     }

//     @Override
//     @Transactional(readOnly = true)
//     public List<WorkOrder>
//     getEquipmentWorkOrders(
//             Long equipmentId
//     ) {

//         return workOrderRepository
//                 .findByEquipmentIdOrderByIdDesc(
//                         equipmentId
//                 );
//     }
}
