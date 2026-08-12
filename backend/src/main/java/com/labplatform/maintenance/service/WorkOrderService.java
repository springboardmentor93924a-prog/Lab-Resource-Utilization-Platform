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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    public WorkOrderService(WorkOrderRepository workOrderRepository,
                            EquipmentRepository equipmentRepository,
                            UserRepository userRepository) {
        this.workOrderRepository = workOrderRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
    }

    private User resolveCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }

    private boolean isAdmin(User user) {
        String role = user.getRole().getName();
        return role.equals("INSTITUTION_ADMIN") || role.equals("SYSTEM_ADMIN")
                || role.equals("LAB_MANAGER") || role.equals("DEPARTMENT_HEAD");
    }

    public WorkOrderResponse createWorkOrder(WorkOrderCreateRequest request, String reporterEmail) {
        User reporter = resolveCurrentUser(reporterEmail);

        if (!isAdmin(reporter)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Only admins can log a maintenance issue");
        }

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Equipment not found with id: " + request.getEquipmentId()));

        WorkOrder wo = new WorkOrder();
        wo.setEquipment(equipment);
        wo.setReportedBy(reporter);
        wo.setIssueDescription(request.getIssueDescription());

        if (request.getPriority() != null && !request.getPriority().isBlank()) {
            try {
                wo.setPriority(WorkOrderPriority.valueOf(request.getPriority().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid priority. Allowed: LOW, MEDIUM, HIGH");
            }
        }
        wo.setStatus(WorkOrderStatus.OPEN);

        WorkOrder saved = workOrderRepository.save(wo);

        equipment.setStatus(EquipmentStatus.MAINTENANCE);
        equipmentRepository.save(equipment);

        return new WorkOrderResponse(saved);
    }

    public WorkOrderResponse assignTechnician(Integer workOrderId, WorkOrderAssignRequest request, String requesterEmail) {
        User requester = resolveCurrentUser(requesterEmail);

        if (!isAdmin(requester)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Only admins can assign a work order");
        }

        WorkOrder wo = findOrThrow(workOrderId);

        User technician = userRepository.findById(request.getTechnicianUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found with id: " + request.getTechnicianUserId()));

        wo.setAssignedTo(technician);
        wo.setStatus(WorkOrderStatus.IN_PROGRESS);
        WorkOrder saved = workOrderRepository.save(wo);
        return new WorkOrderResponse(saved);
    }

    public WorkOrderResponse markComplete(Integer workOrderId, String requesterEmail) {
        User requester = resolveCurrentUser(requesterEmail);
        WorkOrder wo = findOrThrow(workOrderId);

        boolean isAssignedTechnician = wo.getAssignedTo() != null
                && wo.getAssignedTo().getId().equals(requester.getId());

        if (!isAssignedTechnician && !isAdmin(requester)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Only the assigned technician or an admin can complete this work order");
        }

        wo.setStatus(WorkOrderStatus.COMPLETED);
        wo.setCompletedAt(LocalDateTime.now());
        WorkOrder saved = workOrderRepository.save(wo);

        boolean anyOtherOpenWorkOrders = workOrderRepository.findByEquipmentId(wo.getEquipment().getId())
                .stream()
                .anyMatch(w -> !w.getId().equals(wo.getId()) && w.getStatus() != WorkOrderStatus.COMPLETED);

        if (!anyOtherOpenWorkOrders) {
            Equipment equipment = wo.getEquipment();
            equipment.setStatus(EquipmentStatus.AVAILABLE);
            equipmentRepository.save(equipment);
        }

        return new WorkOrderResponse(saved);
    }

    public List<WorkOrderResponse> getAllWorkOrders() {
        return workOrderRepository.findAll()
                .stream().map(WorkOrderResponse::new).collect(Collectors.toList());
    }

    public List<WorkOrderResponse> getMyAssignedWorkOrders(String requesterEmail) {
        User requester = resolveCurrentUser(requesterEmail);
        return workOrderRepository.findByAssignedToId(requester.getId())
                .stream().map(WorkOrderResponse::new).collect(Collectors.toList());
    }

    public List<WorkOrderResponse> getWorkOrdersByEquipment(Long equipmentId) {
        return workOrderRepository.findByEquipmentId(equipmentId)
                .stream().map(WorkOrderResponse::new).collect(Collectors.toList());
    }

    private WorkOrder findOrThrow(Integer id) {
        return workOrderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Work order not found with id: " + id));
    }
}