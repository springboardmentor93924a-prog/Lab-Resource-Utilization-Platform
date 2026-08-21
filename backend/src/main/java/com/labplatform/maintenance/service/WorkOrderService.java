package com.labplatform.maintenance.service;

import com.labplatform.auth.model.User;
import com.labplatform.auth.repository.UserRepository;
import com.labplatform.equipment.model.Equipment;
import com.labplatform.equipment.model.EquipmentStatus;
import com.labplatform.equipment.repository.EquipmentRepository;
import com.labplatform.maintenance.dto.WorkOrderAssignRequest;
import com.labplatform.maintenance.dto.WorkOrderCreateRequest;
import com.labplatform.maintenance.dto.WorkOrderResponse;
import com.labplatform.maintenance.model.WorkOrder;
import com.labplatform.maintenance.model.WorkOrderPriority;
import com.labplatform.maintenance.model.WorkOrderStatus;
import com.labplatform.maintenance.repository.WorkOrderRepository;
import com.labplatform.notification.service.NotificationService;
import com.labplatform.maintenance.dto.WorkOrderCompleteRequest;

import com.labplatform.maintenance.dto.MaintenanceDowntimeReportRow;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.Map;
import java.util.LinkedHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public WorkOrderService(
            WorkOrderRepository workOrderRepository,
            EquipmentRepository equipmentRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.workOrderRepository = workOrderRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private User resolveCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"));
    }

    private boolean isAdmin(User user) {
        String role = user.getRole().getName();

        return role.equals("INSTITUTION_ADMIN")
                || role.equals("SYSTEM_ADMIN")
                || role.equals("LAB_MANAGER")
                || role.equals("DEPARTMENT_HEAD");
    }

    public WorkOrderResponse createWorkOrder(
            WorkOrderCreateRequest request,
            String reporterEmail) {

        User reporter = resolveCurrentUser(reporterEmail);

        if (!isAdmin(reporter)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can log a maintenance issue");
        }

        Equipment equipment = equipmentRepository
                .findById(request.getEquipmentId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Equipment not found with id: "
                                + request.getEquipmentId()));

        WorkOrder wo = new WorkOrder();

        wo.setEquipment(equipment);
        wo.setReportedBy(reporter);
        wo.setIssueDescription(request.getIssueDescription());

        if (request.getPriority() != null
                && !request.getPriority().isBlank()) {

            try {
                wo.setPriority(
                        WorkOrderPriority.valueOf(
                                request.getPriority().toUpperCase()));

            } catch (IllegalArgumentException ex) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid priority. Allowed: LOW, MEDIUM, HIGH");
            }
        }

        wo.setStatus(WorkOrderStatus.OPEN);

        WorkOrder saved = workOrderRepository.save(wo);

        equipment.setStatus(EquipmentStatus.MAINTENANCE);
        equipmentRepository.save(equipment);

        return new WorkOrderResponse(saved);
    }

    public WorkOrderResponse assignTechnician(
            Integer workOrderId,
            WorkOrderAssignRequest request,
            String requesterEmail) {

        User requester = resolveCurrentUser(requesterEmail);

        if (!isAdmin(requester)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can assign a work order");
        }

        WorkOrder wo = findOrThrow(workOrderId);

        User technician = userRepository
                .findById(request.getTechnicianUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found with id: "
                                + request.getTechnicianUserId()));

        wo.setAssignedTo(technician);
        wo.setStatus(WorkOrderStatus.IN_PROGRESS);

        WorkOrder saved = workOrderRepository.save(wo);

        // Notify technician
        notificationService.create(
                technician,
                "WORK_ORDER_ASSIGNED",
                "You have been assigned a maintenance task for "
                        + wo.getEquipment().getEquipmentName()
                        + "."
        );

        return new WorkOrderResponse(saved);
    }

    public WorkOrderResponse markComplete(
            Integer workOrderId,
            WorkOrderCompleteRequest request,
            String requesterEmail) {

        User requester = resolveCurrentUser(requesterEmail);

        WorkOrder wo = findOrThrow(workOrderId);

        boolean isAssignedTechnician =
                wo.getAssignedTo() != null
                        && wo.getAssignedTo()
                        .getId()
                        .equals(requester.getId());

        if (!isAssignedTechnician && !isAdmin(requester)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the assigned technician or an admin can complete this work order");
        }

        // Mark work order as completed
        wo.setStatus(WorkOrderStatus.COMPLETED);
        wo.setCompletedAt(LocalDateTime.now());
        wo.setServiceLog(request.getServiceLog());

        WorkOrder saved = workOrderRepository.save(wo);

        /*
         * Check whether there are any other active work orders
         * for the same equipment.
         */
        boolean anyOtherOpenWorkOrders =
                workOrderRepository
                        .findByEquipmentId(
                                wo.getEquipment().getId())
                        .stream()
                        .anyMatch(w ->
                                !w.getId().equals(wo.getId())
                                        && w.getStatus()
                                        != WorkOrderStatus.COMPLETED);

        /*
         * If there are no other active maintenance work orders,
         * make the equipment available again.
         */
        if (!anyOtherOpenWorkOrders) {

            Equipment equipment = wo.getEquipment();

            equipment.setStatus(EquipmentStatus.AVAILABLE);

            equipmentRepository.save(equipment);
        }

        // =========================================================
        // NEW: NOTIFY LAB MANAGER, DEPARTMENT HEAD AND INSTITUTION ADMIN
        // =========================================================

        if (wo.getEquipment().getInstitution() != null) {

            Integer institutionId =
                    wo.getEquipment().getInstitution().getId();

            Set<UUID> notifiedUserIds = new HashSet<>();

            String[] responsibleRoles = {
                    "LAB_MANAGER",
                    "DEPARTMENT_HEAD",
                    "INSTITUTION_ADMIN"
            };

            for (String roleName : responsibleRoles) {

                List<User> users =
                        userRepository.findByInstitution_IdAndRole_Name(
                                institutionId,
                                roleName
                        );

                for (User user : users) {

                    // Prevent duplicate notifications
                    if (notifiedUserIds.add(user.getId())) {

                        notificationService.create(
                                user,
                                "WORK_ORDER_COMPLETED",
                                "Maintenance work order for "
                                        + wo.getEquipment().getEquipmentName()
                                        + " has been completed by "
                                        + (wo.getAssignedTo() != null
                                        ? wo.getAssignedTo().getFullName()
                                        : "the assigned technician")
                                        + "."
                        );
                    }
                }
            }
        }

        return new WorkOrderResponse(saved);
    }

    public List<WorkOrderResponse> getAllWorkOrders() {

        return workOrderRepository.findAll()
                .stream()
                .map(WorkOrderResponse::new)
                .collect(Collectors.toList());
    }

    public List<WorkOrderResponse> getMyAssignedWorkOrders(
            String requesterEmail) {

        User requester = resolveCurrentUser(requesterEmail);

        return workOrderRepository
                .findByAssignedToId(requester.getId())
                .stream()
                .map(WorkOrderResponse::new)
                .collect(Collectors.toList());
    }

    public List<WorkOrderResponse> getWorkOrdersByEquipment(
            Long equipmentId) {

        return workOrderRepository
                .findByEquipmentId(equipmentId)
                .stream()
                .map(WorkOrderResponse::new)
                .collect(Collectors.toList());
    }

    public List<MaintenanceDowntimeReportRow>
    generateMaintenanceDowntimeReport(
            LocalDate from,
            LocalDate to) {

        if (from == null || to == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "From and To dates are required");
        }

        if (from.isAfter(to)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "From date cannot be after To date");
        }

        LocalDateTime startDateTime =
                from.atStartOfDay();

        LocalDateTime endDateTime =
                to.plusDays(1).atStartOfDay();

        List<WorkOrder> workOrders =
                workOrderRepository.findAll();

        Map<Long, MaintenanceDowntimeReportRow> report =
                new LinkedHashMap<>();

        for (WorkOrder wo : workOrders) {

            /*
             * Use the time when maintenance actually started.
             */
            LocalDateTime maintenanceStart =
                    wo.getMaintenanceStartedAt();

            if (maintenanceStart == null) {
                continue;
            }

            /*
             * Only include work orders whose maintenance
             * started inside the selected date range.
             */
            if (maintenanceStart.isBefore(startDateTime)
                    || !maintenanceStart.isBefore(endDateTime)) {
                continue;
            }

            Long equipmentId =
                    wo.getEquipment().getId();

            String equipmentName =
                    wo.getEquipment().getEquipmentName();

            /*
             * Create the row if this equipment
             * doesn't already exist.
             */
            MaintenanceDowntimeReportRow row =
                    report.get(equipmentId);

            if (row == null) {

                row = new MaintenanceDowntimeReportRow(
                        equipmentId,
                        equipmentName,
                        0L,
                        0L,
                        0L,
                        0L
                );

                report.put(equipmentId, row);
            }

            /*
             * Total work orders
             */
            row.setTotalWorkOrders(
                    row.getTotalWorkOrders() + 1
            );

            /*
             * Completed / In Progress counts
             */
            if (wo.getStatus() ==
                    WorkOrderStatus.COMPLETED) {

                row.setCompletedWorkOrders(
                        row.getCompletedWorkOrders() + 1
                );

            } else {

                row.setInProgressWorkOrders(
                        row.getInProgressWorkOrders() + 1
                );
            }

            /*
             * Calculate downtime.
             *
             * Completed:
             * maintenanceStartedAt -> completedAt
             *
             * Active:
             * maintenanceStartedAt -> current time
             */
            LocalDateTime endTime;

            if (wo.getCompletedAt() != null) {
                endTime = wo.getCompletedAt();
            } else {
                endTime = LocalDateTime.now();
            }

            long downtimeMinutes =
                    Math.max(
                            0,
                            Duration.between(
                                    maintenanceStart,
                                    endTime
                            ).toMinutes()
                    );

            row.setTotalDowntimeMinutes(
                    row.getTotalDowntimeMinutes()
                            + downtimeMinutes
            );
        }

        return List.copyOf(report.values());
    }

    private WorkOrder findOrThrow(Integer id) {

        return workOrderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Work order not found with id: " + id));
    }
}