package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.MaintenanceRequest;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.entity.WorkOrder;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.MaintenanceRequestRepository;
import com.example.lab_platform.repository.UserRepository;
import com.example.lab_platform.repository.WorkOrderRepository;
import com.example.lab_platform.service.BookingService;
import com.example.lab_platform.service.EquipmentDowntimeService;
import com.example.lab_platform.service.NotificationService;
import com.example.lab_platform.service.WorkOrderService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class WorkOrderServiceImpl implements WorkOrderService {

    private static final List<String> CLOSED_STATUSES = List.of("completed", "cancelled");

    private final WorkOrderRepository workOrderRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final EquipmentDowntimeService equipmentDowntimeService;
    private final NotificationService notificationService;
    private final BookingService bookingService;

    public WorkOrderServiceImpl(
            WorkOrderRepository workOrderRepository,
            EquipmentRepository equipmentRepository,
            UserRepository userRepository,
            MaintenanceRequestRepository maintenanceRequestRepository,
            EquipmentDowntimeService equipmentDowntimeService,
            NotificationService notificationService,
            BookingService bookingService) {

        this.workOrderRepository = workOrderRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.equipmentDowntimeService = equipmentDowntimeService;
        this.notificationService = notificationService;
        this.bookingService = bookingService;
    }

    private User getLoggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    @Override
    public List<WorkOrder> getAllWorkOrders() {
        return workOrderRepository.findAll();
    }

    @Override
    public WorkOrder getWorkOrderById(Integer id) {
        return workOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work order not found: " + id));
    }

    @Override
    public WorkOrder createWorkOrder(WorkOrder workOrder) {

        Equipment equipment = workOrder.getEquipment();
        if (equipment == null || equipment.getEquipmentId() == null) {
            throw new RuntimeException("Equipment is required to create a work order");
        }

        // Capture the id in its own final variable before reassigning
        // "equipment" below - the lambda in orElseThrow can only
        // capture effectively-final locals, and "equipment" itself
        // is reassigned on the next line.
        final Integer equipmentId = equipment.getEquipmentId();
        equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found: " + equipmentId));
        workOrder.setEquipment(equipment);

        if (workOrder.getWorkOrderDate() == null) {
            workOrder.setWorkOrderDate(LocalDate.now());
        }
        if (workOrder.getWorkOrderStatus() == null || workOrder.getWorkOrderStatus().isBlank()) {
            workOrder.setWorkOrderStatus("OPEN");
        }

        resolveAssignedTechnician(workOrder);

        WorkOrder saved = workOrderRepository.save(workOrder);

        applyEquipmentSideEffects(saved, "New work order raised: " + saved.getDescription());
        notifyAssignedTechnician(saved);

        return saved;
    }

    @Override
    public WorkOrder createWorkOrderFromRequest(Integer requestId, WorkOrder workOrder) {

        MaintenanceRequest request = maintenanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Maintenance request not found: " + requestId));

        WorkOrder toCreate = (workOrder != null) ? workOrder : new WorkOrder();
        toCreate.setMaintenanceRequest(request);
        toCreate.setEquipment(request.getEquipment());

        if (toCreate.getDescription() == null || toCreate.getDescription().isBlank()) {
            toCreate.setDescription(request.getDescription());
        }
        if (toCreate.getPriority() == null || toCreate.getPriority().isBlank()) {
            toCreate.setPriority(request.getPriority());
        }

        WorkOrder saved = createWorkOrder(toCreate);

        request.setRequestStatus("IN_PROGRESS");
        maintenanceRequestRepository.save(request);

        return saved;
    }

    @Override
    public WorkOrder updateWorkOrder(Integer id, WorkOrder updatedWorkOrder) {

        WorkOrder existing = getWorkOrderById(id);

        if (updatedWorkOrder.getScheduledDate() != null) {
            existing.setScheduledDate(updatedWorkOrder.getScheduledDate());
        }
        if (updatedWorkOrder.getCompletionDate() != null) {
            existing.setCompletionDate(updatedWorkOrder.getCompletionDate());
        }
        if (updatedWorkOrder.getPriority() != null) {
            existing.setPriority(updatedWorkOrder.getPriority());
        }
        if (updatedWorkOrder.getDescription() != null) {
            existing.setDescription(updatedWorkOrder.getDescription());
        }
        if (updatedWorkOrder.getNotes() != null) {
            existing.setNotes(updatedWorkOrder.getNotes());
        }
        if (updatedWorkOrder.getAssignedTo() != null && updatedWorkOrder.getAssignedTo().getUserId() != null) {
            existing.setAssignedTo(updatedWorkOrder.getAssignedTo());
        }

        if (updatedWorkOrder.getWorkOrderStatus() != null) {
            existing.setWorkOrderStatus(updatedWorkOrder.getWorkOrderStatus());

            if (isClosedStatus(existing.getWorkOrderStatus()) && existing.getCompletionDate() == null) {
                existing.setCompletionDate(LocalDate.now());
            }
        }

        WorkOrder saved = workOrderRepository.save(existing);

        applyEquipmentSideEffects(saved, "Work order updated: " + saved.getDescription());

        return saved;
    }

    @Override
    public WorkOrder assignTechnician(Integer id, Integer technicianId) {

        WorkOrder workOrder = getWorkOrderById(id);

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found: " + technicianId));

        workOrder.setAssignedTo(technician);

        WorkOrder saved = workOrderRepository.save(workOrder);

        notifyAssignedTechnician(saved);

        return saved;
    }

    @Override
    public List<WorkOrder> getMyWorkOrders() {
        User loggedInUser = getLoggedInUser();
        return workOrderRepository.findByAssignedTo_UserId(loggedInUser.getUserId());
    }

    @Override
    public List<WorkOrder> getWorkOrdersForEquipment(Integer equipmentId) {
        return workOrderRepository.findByEquipment_EquipmentId(equipmentId);
    }

    // ---------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------

    private void resolveAssignedTechnician(WorkOrder workOrder) {
        if (workOrder.getAssignedTo() != null && workOrder.getAssignedTo().getUserId() != null) {
            User technician = userRepository.findById(workOrder.getAssignedTo().getUserId())
                    .orElseThrow(() -> new RuntimeException(
                            "Technician not found: " + workOrder.getAssignedTo().getUserId()));
            workOrder.setAssignedTo(technician);
        }
    }

    private boolean isClosedStatus(String status) {
        return status != null && CLOSED_STATUSES.contains(status.toLowerCase());
    }

    /*
     * Keeps the equipment record and its downtime window in sync with
     * the work order lifecycle:
     *  - any open/in-progress work order -> equipment "Under Maintenance"
     *    and a downtime window is opened (idempotent — a second work
     *    order on the same equipment won't stack a second window).
     *  - once the work order is Completed/Cancelled, and no other work
     *    order or maintenance record is still blocking the equipment,
     *    it's released back to "Available" and the downtime window is
     *    closed. The freed-up waitlist is then re-processed, same as
     *    MaintenanceServiceImpl does today.
     */
    private void applyEquipmentSideEffects(WorkOrder workOrder, String downtimeReason) {

        Equipment equipment = workOrder.getEquipment();
        if (equipment == null) {
            return;
        }

        boolean closed = isClosedStatus(workOrder.getWorkOrderStatus());

        if (!closed) {
            equipment.setStatus("Under Maintenance");
            equipmentRepository.save(equipment);
            equipmentDowntimeService.openDowntimeWindow(equipment, workOrder, downtimeReason);
            return;
        }

        boolean stillBlocked = workOrderRepository
                .findByEquipment_EquipmentId(equipment.getEquipmentId())
                .stream()
                .anyMatch(wo -> !isClosedStatus(wo.getWorkOrderStatus()));

        if (!stillBlocked) {
            equipment.setStatus("Available");
            equipmentRepository.save(equipment);
            equipmentDowntimeService.closeOpenDowntimeWindow(equipment);
            bookingService.processWaitlistForEquipment(equipment.getEquipmentId());
        }
    }

    private void notifyAssignedTechnician(WorkOrder workOrder) {
        User technician = workOrder.getAssignedTo();
        if (technician == null) {
            return;
        }

        String equipmentName = workOrder.getEquipment() != null
                ? workOrder.getEquipment().getEquipmentName()
                : "equipment";

        notificationService.create(
                technician,
                "WORK_ORDER_ASSIGNED",
                "New work order assigned",
                "You have been assigned work order #" + workOrder.getWorkOrderId()
                        + " for " + equipmentName + ".",
                workOrder.getWorkOrderId()
        );
    }
}
