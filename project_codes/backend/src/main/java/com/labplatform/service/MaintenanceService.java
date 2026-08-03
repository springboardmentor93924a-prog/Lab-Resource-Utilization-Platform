package com.labplatform.service;

import com.labplatform.entity.*;
import com.labplatform.repository.EquipmentRepository;
import com.labplatform.repository.MaintenanceRecordRepository;
import com.labplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRecordRepository maintenanceRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public MaintenanceRecord schedule(Long equipmentId, Long technicianId, String type, LocalDate scheduledDate, String notes) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));

        User technician = null;
        if (technicianId != null) {
            technician = userRepository.findById(technicianId)
                    .orElseThrow(() -> new IllegalArgumentException("Technician not found"));
        }

        MaintenanceRecord record = MaintenanceRecord.builder()
                .equipment(equipment).assignedTechnician(technician)
                .type(type).scheduledDate(scheduledDate).notes(notes)
                .status(MaintenanceStatus.SCHEDULED)
                .build();

        MaintenanceRecord saved = maintenanceRepository.save(record);

        if (technician != null) {
            notificationService.notify(technician, "Maintenance task assigned",
                    type + " scheduled for " + equipment.getName() + " on " + scheduledDate, "MAINTENANCE_ALERT");
        }
        return saved;
    }

    public MaintenanceRecord startWork(Long id) {
        MaintenanceRecord record = get(id);
        record.setStatus(MaintenanceStatus.IN_PROGRESS);
        record.getEquipment().setStatus(EquipmentStatus.UNDER_MAINTENANCE);
        equipmentRepository.save(record.getEquipment());
        return maintenanceRepository.save(record);
    }

    public MaintenanceRecord complete(Long id, Integer downtimeHours, String notes) {
        MaintenanceRecord record = get(id);
        record.setStatus(MaintenanceStatus.COMPLETED);
        record.setCompletedDate(LocalDate.now());
        record.setDowntimeHours(downtimeHours);
        if (notes != null) record.setNotes(notes);

        Equipment equipment = record.getEquipment();
        equipment.setStatus(EquipmentStatus.AVAILABLE);
        if ("CALIBRATION".equalsIgnoreCase(record.getType())) {
            equipment.setLastCalibrationDate(LocalDate.now());
            equipment.setNextCalibrationDue(LocalDate.now().plusMonths(6));
        }
        equipmentRepository.save(equipment);

        return maintenanceRepository.save(record);
    }

    public MaintenanceRecord get(Long id) {
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Maintenance record not found"));
    }

    public List<MaintenanceRecord> forEquipment(Long equipmentId) {
        return maintenanceRepository.findByEquipmentId(equipmentId);
    }

    public List<MaintenanceRecord> forTechnician(Long technicianId) {
        return maintenanceRepository.findByAssignedTechnicianId(technicianId);
    }

    public List<MaintenanceRecord> byStatus(MaintenanceStatus status) {
        return maintenanceRepository.findByStatus(status);
    }

    public List<MaintenanceRecord> all() {
        return maintenanceRepository.findAll();
    }
}
