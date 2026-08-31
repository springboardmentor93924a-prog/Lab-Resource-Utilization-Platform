package com.infosys.labresource.maintainance.Service;

import com.infosys.labresource.Equipment.Repository.EquipmentRepository;
import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.Equipment.entity.EquipmentStatus;
import com.infosys.labresource.maintainance.Entities.MaintenanceSchedule;
import com.infosys.labresource.maintainance.Entities.WorkOrder;
import com.infosys.labresource.maintainance.Entities.orderStatus;
import com.infosys.labresource.maintainance.Repository.MaintenanceScheduledRepo;
import com.infosys.labresource.maintainance.Repository.WorkOrderRepository;
import com.infosys.labresource.user.Repository.UserRepository;
import com.infosys.labresource.user.entites.Role;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrderServiceImpl implements WorkOrderService{
    private final WorkOrderRepository workOrderRepo;
    private final MaintenanceScheduledRepo scheduleRepo;
    private final EquipmentRepository equipmentRepo;
    private final UserRepository userRepo;

    @Override
    public WorkOrder createWorkOrder(Long scheduleId, String description) {

        MaintenanceSchedule schedule = scheduleRepo.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Maintenance schedule not found"));

        if (workOrderRepo.findByMaintenanceScheduleScheduleId(scheduleId).isPresent()) {
            throw new RuntimeException("Work order already exists for this schedule");
        }

        WorkOrder order = new WorkOrder();
        order.setMaintenanceSchedule(schedule);
        order.setEquipment(schedule.getEquipment());
        order.setDescription(description);
        order.setStatus(orderStatus.CREATED);
        order.setCreatedAt(LocalDateTime.now());
        return workOrderRepo.save(order);
    }

    @Override
    public WorkOrder assignTechnician(Long workOrderId, Long technicianId) {

        WorkOrder order = getWorkOrder(workOrderId);

        UserEntity technician = userRepo.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));
        if (technician.getRole() != Role.LAB_TECHNICIAN) {
            throw new RuntimeException("Selected user is not a Lab Technician");
        }else {
            order.setAssignedTechnician(technician);
            order.setStatus(orderStatus.ASSIGNED);
        }
        return workOrderRepo.save(order);
    }
    @Override
    public WorkOrder startWork(Long workOrderId) {

        WorkOrder order = getWorkOrder(workOrderId);

        if (order.getStatus() != orderStatus.ASSIGNED) {
            throw new RuntimeException("Work order must be assigned before starting");
        }

        Equipment equipment = order.getEquipment();

        if (equipment.getStatus() == EquipmentStatus.UNDER_MAINTENANCE) {
            throw new RuntimeException("Equipment is already under maintenance");
        }

        equipment.setStatus(EquipmentStatus.UNDER_MAINTENANCE);
        equipmentRepo.save(equipment);

        order.setStatus(orderStatus.IN_PROGRESS);
        order.setActualStart(LocalDateTime.now());

        return workOrderRepo.save(order);
    }
    @Override
    public WorkOrder completeWork(Long workOrderId) {

        WorkOrder order = getWorkOrder(workOrderId);

        if (order.getStatus() != orderStatus.IN_PROGRESS) {
            throw new RuntimeException("Only in-progress work orders can be completed");
        }

        Equipment equipment = order.getEquipment();

        equipment.setStatus(EquipmentStatus.AVAILABLE);
        equipmentRepo.save(equipment);

        order.setStatus(orderStatus.COMPLETED);
        order.setActualEnd(LocalDateTime.now());
        order.setCompletedAt(LocalDateTime.now());

        return workOrderRepo.save(order);
    }
    @Override
    public WorkOrder getWorkOrder(Long workOrderId) {

        return workOrderRepo.findById(workOrderId).orElseThrow(() -> new RuntimeException("Work order not found"));
    }

    @Override
    public List<WorkOrder> getTechnicianWorkOrders(Long technicianId) {

        return workOrderRepo.findByAssignedTechnicianUserId(technicianId);
    }
}
