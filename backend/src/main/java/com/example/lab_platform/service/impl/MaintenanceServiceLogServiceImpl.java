package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.MaintenanceServiceLog;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.entity.WorkOrder;
import com.example.lab_platform.repository.MaintenanceServiceLogRepository;
import com.example.lab_platform.repository.WorkOrderRepository;
import com.example.lab_platform.service.MaintenanceServiceLogService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MaintenanceServiceLogServiceImpl implements MaintenanceServiceLogService {

    private final MaintenanceServiceLogRepository serviceLogRepository;
    private final WorkOrderRepository workOrderRepository;

    public MaintenanceServiceLogServiceImpl(
            MaintenanceServiceLogRepository serviceLogRepository,
            WorkOrderRepository workOrderRepository) {

        this.serviceLogRepository = serviceLogRepository;
        this.workOrderRepository = workOrderRepository;
    }

    private User getLoggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principal = authentication.getPrincipal();
        return (principal instanceof User) ? (User) principal : null;
    }

    @Override
    public List<MaintenanceServiceLog> getLogsForWorkOrder(Integer workOrderId) {
        return serviceLogRepository.findByWorkOrder_WorkOrderId(workOrderId);
    }

    @Override
    public List<MaintenanceServiceLog> getHistoryForEquipment(Integer equipmentId) {
        return serviceLogRepository.findHistoryByEquipmentId(equipmentId);
    }

    @Override
    public MaintenanceServiceLog addLog(Integer workOrderId, MaintenanceServiceLog log) {

        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found: " + workOrderId));

        log.setWorkOrder(workOrder);

        if (log.getTechnician() == null) {
            log.setTechnician(getLoggedInUser());
        }
        if (log.getServiceDate() == null) {
            log.setServiceDate(LocalDate.now());
        }

        return serviceLogRepository.save(log);
    }
}
