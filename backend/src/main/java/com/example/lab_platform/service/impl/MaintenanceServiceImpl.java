package com.example.lab_platform.service.impl;
 
import com.example.lab_platform.entity.Maintenance;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.MaintenanceRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.service.MaintenanceService;
import com.example.lab_platform.service.BookingService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
 
import java.util.List;
 
@Service
public class MaintenanceServiceImpl implements MaintenanceService {
 
 
    private final MaintenanceRepository maintenanceRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingService bookingService;
 
 
    public MaintenanceServiceImpl(
            MaintenanceRepository maintenanceRepository,
            EquipmentRepository equipmentRepository,
            BookingService bookingService) {
 
        this.maintenanceRepository = maintenanceRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingService = bookingService;
    }
 
 
 
    @Override
    public List<Maintenance> getAllMaintenance() {
 
        return maintenanceRepository.findAll();
    }
 
 
 
    @Override
    public Maintenance getMaintenanceById(Integer id) {
 
        return maintenanceRepository.findById(id)
                .orElseThrow(() ->
                new RuntimeException("Maintenance not found"));
    }
 
 
 
    @Override
    public Maintenance createMaintenance(
            Maintenance maintenance) {
 
 
        Equipment equipment =
                maintenance.getEquipment();
 
 
        if(equipment != null) {
 
            equipment.setStatus("Under Maintenance");
 
            equipmentRepository.save(equipment);
        }
 
 
        maintenance.setMaintenanceStatus("Active");
 
 
        return maintenanceRepository.save(maintenance);
    }
 
 
 
    /*
     * Updates an existing maintenance record (type, description,
     * dates, status). When the status is changed to "Completed",
     * the linked equipment is immediately released back to
     * "Available" instead of waiting on the next scheduler pass,
     * unless another still-active maintenance record exists for
     * the same equipment.
     */
    @Override
    public Maintenance updateMaintenance(Integer id, Maintenance updatedMaintenance) {
 
        Maintenance existing = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance not found"));
 
        if (updatedMaintenance.getMaintenanceType() != null) {
            existing.setMaintenanceType(updatedMaintenance.getMaintenanceType());
        }
 
        if (updatedMaintenance.getDescription() != null) {
            existing.setDescription(updatedMaintenance.getDescription());
        }
 
        if (updatedMaintenance.getMaintenanceDate() != null) {
            existing.setMaintenanceDate(updatedMaintenance.getMaintenanceDate());
        }
 
        if (updatedMaintenance.getNextMaintenanceDate() != null) {
            existing.setNextMaintenanceDate(updatedMaintenance.getNextMaintenanceDate());
        }
 
        if (updatedMaintenance.getMaintenanceStatus() != null) {
            existing.setMaintenanceStatus(updatedMaintenance.getMaintenanceStatus());
        }

        if (updatedMaintenance.getAssignedTechnician() != null) {
            existing.setAssignedTechnician(updatedMaintenance.getAssignedTechnician());
        }

        Maintenance saved = maintenanceRepository.save(existing);
 
        syncEquipmentStatus(saved);
 
        return saved;
    }
 
    private void syncEquipmentStatus(Maintenance maintenance) {
 
        Equipment equipment = maintenance.getEquipment();
 
        if (equipment == null) {
            return;
        }
 
        String status = maintenance.getMaintenanceStatus();
 
        boolean justCompletedOrCancelled =
                status != null
                        && (status.equalsIgnoreCase("Completed")
                        || status.equalsIgnoreCase("Cancelled"));
 
        if (!justCompletedOrCancelled) {
            equipment.setStatus("Under Maintenance");
            equipmentRepository.save(equipment);
            return;
        }
 
        boolean stillBlocked = maintenanceRepository
                .findByEquipment_EquipmentId(equipment.getEquipmentId())
                .stream()
                .anyMatch(m ->
                        m.getMaintenanceStatus() != null
                                && (m.getMaintenanceStatus().equalsIgnoreCase("Active")
                                || m.getMaintenanceStatus().equalsIgnoreCase("Scheduled")
                                || m.getMaintenanceStatus().equalsIgnoreCase("In Progress")));
 
        if (!stillBlocked) {
            equipment.setStatus("Available");
            equipmentRepository.save(equipment);

            /*
             * This call was missing entirely before: equipment coming
             * off maintenance never re-ran the waitlist cascade, so
             * anyone WAITING/NOTIFIED for it just sat there until some
             * unrelated event (a different booking freeing up, etc.)
             * happened to trigger processWaitlistForEquipment. Now the
             * whole active queue for this equipment (priority entries
             * first, then earliest queueDate) is walked and each entry
             * tried against its own requested window — same cascade
             * used by BookingServiceImpl/EquipmentFeedbackServiceImpl/
             * CalibrationServiceImpl.
             */
            bookingService.processWaitlistForEquipment(equipment.getEquipmentId());
        }
    }

    @Override
    public List<Maintenance> getMyTasks() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User loggedInUser = (User) authentication.getPrincipal();

        return maintenanceRepository
                .findByAssignedTechnician_UserId(loggedInUser.getUserId());
    }

}