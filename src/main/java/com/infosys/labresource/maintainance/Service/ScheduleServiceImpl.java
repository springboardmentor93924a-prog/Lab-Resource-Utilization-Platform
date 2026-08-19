package com.infosys.labresource.maintainance.Service;

import com.infosys.labresource.Equipment.Repository.EquipmentRepository;
import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.maintainance.Entities.MaintenanceRequest;
import com.infosys.labresource.maintainance.Entities.MaintenanceSchedule;
import com.infosys.labresource.maintainance.Entities.RequestStatus;
import com.infosys.labresource.maintainance.Repository.MaintenanceScheduledRepo;
import com.infosys.labresource.maintainance.Repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {
    private final MaintenanceScheduledRepo scheduleRepo;
    private final RequestRepository requestRepo;
    private final EquipmentRepository equipmentRepo;

    @Override
    public MaintenanceSchedule createSchedule(Long requestId, LocalDateTime start, LocalDateTime end) {

        MaintenanceRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Maintenance request not found"));

        if (req.getStatus() != RequestStatus.APPROVED) {
            throw new RuntimeException("Maintenance request must be approved first");
        }

        if (start == null || end == null || !start.isBefore(end)) {
            throw new RuntimeException("Invalid maintenance time");
        }

        long minutes = java.time.Duration.between(start, end).toMinutes();

        if (minutes < req.getRequiredDuration()) {
            throw new RuntimeException("Maintenance window is shorter than required duration");
        }
        Equipment equipment = req.getEquipment();

        boolean conflict = scheduleRepo
                .existsByEquipmentAndScheduledStartLessThanAndScheduledEndGreaterThan(
                        equipment, end, start);

        if (conflict) {
            throw new RuntimeException("Maintenance schedule conflicts with existing maintenance");
        }

        MaintenanceSchedule schedule = new MaintenanceSchedule();
        schedule.setMaintenanceRequest(req);
        schedule.setEquipment(equipment);
        schedule.setScheduledStart(start);
        schedule.setScheduledEnd(end);
        schedule.setCreatedAt(LocalDateTime.now());

        return scheduleRepo.save(schedule);
    }
    @Override
    public MaintenanceSchedule getSchedule(Long scheduleId) {

        return scheduleRepo.findById(scheduleId).orElseThrow(() -> new RuntimeException("Maintenance schedule not found"));
    }

    @Override
    public List<MaintenanceSchedule> getEquipmentSchedules(Long equipmentId) {

        Equipment equipment = equipmentRepo.findById(equipmentId).orElseThrow(() -> new RuntimeException("Equipment not found"));

        return scheduleRepo.findByEquipmentOrderByScheduledStartAsc(equipment);
    }
}
