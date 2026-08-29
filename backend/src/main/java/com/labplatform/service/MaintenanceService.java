package com.labplatform.service;

import com.labplatform.dto.Dtos;
import com.labplatform.entity.*;
import com.labplatform.repository.EquipmentRepository;
import com.labplatform.repository.MaintenanceTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceTaskRepository maintenanceRepository;
    private final EquipmentRepository equipmentRepository;

    public List<MaintenanceTask> getAllTasks() { 
        return maintenanceRepository.findAll(); 
    }

    @Transactional
    public MaintenanceTask scheduleTask(Dtos.MaintenanceRequest req) {
        Equipment equipment = equipmentRepository.findById(req.equipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        equipment.setStatus(EquipmentStatus.UNDER_MAINTENANCE);
        equipmentRepository.save(equipment);

        MaintenanceTask task = MaintenanceTask.builder()
                .equipment(equipment)
                .taskDescription(req.description())
                .scheduledDate(req.scheduledDate())
                .status(MaintenanceStatus.SCHEDULED)
                .build();

        return maintenanceRepository.save(task);
    }

    @Transactional
    public MaintenanceTask completeTask(Long taskId, String notes) {
        MaintenanceTask task = maintenanceRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setStatus(MaintenanceStatus.COMPLETED);
        task.setCompletedDate(LocalDateTime.now());
        task.setServiceNotes(notes);

        Equipment eq = task.getEquipment();
        eq.setStatus(EquipmentStatus.AVAILABLE);
        equipmentRepository.save(eq);

        return maintenanceRepository.save(task);
    }
}