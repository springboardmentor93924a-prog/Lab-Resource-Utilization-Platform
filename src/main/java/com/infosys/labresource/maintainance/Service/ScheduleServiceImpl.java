package com.infosys.labresource.maintainance.Service;

import com.infosys.labresource.Equipment.Repository.EquipmentRepository;
import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.booking.Repository.BookingRepository;
import com.infosys.labresource.booking.entity.BookingStatus;
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
private final BookingRepository bookingRepo;
    @Override
    public MaintenanceSchedule createSchedule(Long requestId, LocalDateTime start, LocalDateTime end) {

        MaintenanceRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Maintenance request not found"));

        if (req.getStatus() != RequestStatus.APPROVED) {
            throw new RuntimeException("Maintenance request must be approved first");
        }

        if (start == null || end == null) {
            throw new RuntimeException("Maintenance start and end time are required");
        }

        if (!start.isBefore(end)) {
            throw new RuntimeException("Maintenance start time must be before end time");
        }

        Equipment equipment = req.getEquipment();

        boolean bookingConflict = bookingRepo
                .existsByEquipmentAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
                        equipment,
                        BookingStatus.CONFIRMED,
                        end,
                        start);

        if (bookingConflict) {
            throw new RuntimeException("Selected maintenance slot conflicts with a confirmed booking");
        }

        boolean maintenanceConflict = scheduleRepo
                .existsByEquipmentAndScheduledStartLessThanAndScheduledEndGreaterThan(
                        equipment,
                        end,
                        start);

        if (maintenanceConflict) {
            throw new RuntimeException("Selected maintenance slot conflicts with another maintenance schedule");
        }

        long minutes = java.time.Duration.between(start, end).toMinutes();

        if (minutes < req.getRequiredDuration()) {
            throw new RuntimeException("Maintenance window is shorter than required duration");
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
