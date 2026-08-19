package com.infosys.labresource.maintainance.Service;

import com.infosys.labresource.maintainance.Entities.MaintenanceSchedule;

import java.time.LocalDateTime;
import java.util.List;

public interface ScheduleService {
    MaintenanceSchedule createSchedule(Long requestId, LocalDateTime start,
                                       LocalDateTime end);

    MaintenanceSchedule getSchedule(Long scheduleId);

    List<MaintenanceSchedule> getEquipmentSchedules(Long equipmentId);
}
