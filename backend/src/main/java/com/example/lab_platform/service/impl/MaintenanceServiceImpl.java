package com.example.lab_platform.service.impl;
 
import com.example.lab_platform.entity.Maintenance;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.MaintenanceRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.UserRepository;
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
    private final UserRepository userRepository;
 
 
    public MaintenanceServiceImpl(
            MaintenanceRepository maintenanceRepository,
            EquipmentRepository equipmentRepository,
            BookingService bookingService,
            UserRepository userRepository) {
 
        this.maintenanceRepository = maintenanceRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingService = bookingService;
        this.userRepository = userRepository;
    }
 
 
 
    @Override
    public List<Maintenance> getAllMaintenance() {
        User user = getLoggedInUser();
        String role = getRole(user);
        List<Maintenance> records = maintenanceRepository.findAll();

        if ("SYSTEM_ADMIN".equalsIgnoreCase(role)) return records;
        return records.stream()
            .filter(record -> canManageEquipment(user, role, record.getEquipment()))
            .toList();
    }
 
 
 
    @Override
    public Maintenance getMaintenanceById(Integer id) {
        Maintenance record = maintenanceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Maintenance not found"));
        User user = getLoggedInUser();
        assertCanManageEquipment(user, getRole(user), record.getEquipment());
        if ("LAB_TECHNICIAN".equalsIgnoreCase(getRole(user))
                && (record.getAssignedTechnician() == null
                || !user.getUserId().equals(record.getAssignedTechnician().getUserId()))) {
            throw new RuntimeException("You can only view maintenance tasks assigned to you");
        }
        return record;
    }
 
 
 
    @Override
    public Maintenance createMaintenance(
            Maintenance maintenance) {
        User user = getLoggedInUser();
        String role = getRole(user);
        if (maintenance.getEquipment() == null
                || maintenance.getEquipment().getEquipmentId() == null) {
            throw new RuntimeException("Equipment is required");
        }

        Equipment equipment = equipmentRepository.findById(
                        maintenance.getEquipment().getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
        assertCanManageEquipment(user, role, equipment);

        if (maintenance.getAssignedTechnician() != null) {
            if (maintenance.getAssignedTechnician().getUserId() == null) {
                throw new RuntimeException("Assigned technician is required");
            }
            User assigned = userRepository.findById(
                            maintenance.getAssignedTechnician().getUserId())
                    .orElseThrow(() -> new RuntimeException("Assigned technician not found"));
            if (!"LAB_TECHNICIAN".equalsIgnoreCase(getRole(assigned))
                    || !canManageEquipment(user, role, equipment)
                    || assigned.getInstitution() == null
                    || !assigned.getInstitution().getInstitutionId()
                            .equals(equipment.getInstitution().getInstitutionId())
                    || assigned.getDepartment() == null
                    || equipment.getDepartment() == null
                    || !assigned.getDepartment().getDepartmentId()
                            .equals(equipment.getDepartment().getDepartmentId())) {
                throw new RuntimeException("Technician must belong to the equipment's institution and department");
            }
            maintenance.setAssignedTechnician(assigned);
        }
 
 
        if(equipment != null) {
 
            equipment.setStatus("Under Maintenance");
 
            equipmentRepository.save(equipment);
        }
 
 
        maintenance.setEquipment(equipment);
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
     *
     * Role scoping: a Lab Technician may only touch a record already
     * assigned to them (status/description/dates — logging their own
     * work), and cannot reassign it to someone else. Reassignment and
     * editing any other technician's record is a Lab Manager /
     * Department Head / admin action only.
     */
    @Override
    public Maintenance updateMaintenance(Integer id, Maintenance updatedMaintenance) {
 
        Maintenance existing = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance not found"));

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        User loggedInUser = (User) authentication.getPrincipal();
        String role = loggedInUser.getRole() != null
                ? loggedInUser.getRole().getRoleName()
                : null;
        boolean isTechnician = "LAB_TECHNICIAN".equalsIgnoreCase(role);

        assertCanManageEquipment(loggedInUser, role, existing.getEquipment());

        if (isTechnician) {
            boolean assignedToCaller = existing.getAssignedTechnician() != null
                    && existing.getAssignedTechnician().getUserId().equals(loggedInUser.getUserId());

            if (!assignedToCaller) {
                throw new RuntimeException(
                        "You can only update maintenance tasks assigned to you");
            }

            if (updatedMaintenance.getAssignedTechnician() != null
                    && !updatedMaintenance.getAssignedTechnician().getUserId()
                            .equals(loggedInUser.getUserId())) {
                throw new RuntimeException(
                        "Technicians cannot reassign a maintenance task — ask a Lab Manager or Department Head");
            }
        }
 
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

            String requestedStatus = updatedMaintenance.getMaintenanceStatus();
            boolean requestingRejected = requestedStatus.equalsIgnoreCase("Rejected");
            boolean wasRejected = "Rejected".equalsIgnoreCase(existing.getMaintenanceStatus());

            if (requestingRejected) {
                // Only a Lab Manager (or System Admin) reviewing finished
                // work can reject it — a technician can never set this
                // status on their own task.
                if (isTechnician) {
                    throw new RuntimeException(
                            "Only a Lab Manager can reject a completed task");
                }
                if (!"Completed".equalsIgnoreCase(existing.getMaintenanceStatus())) {
                    throw new RuntimeException(
                            "Only a completed task can be rejected");
                }
                String reason = updatedMaintenance.getRejectionReason();
                if (reason == null || reason.trim().isEmpty()) {
                    throw new RuntimeException(
                            "A reason is required to reject a completed task");
                }
                existing.setRejectionReason(reason.trim());

            } else if (wasRejected) {
                // The technician (or a manager) is moving the task on from
                // "Rejected" — that's the redo being resubmitted, so the
                // old reason no longer applies once it's acted on.
                existing.setRejectionReason(null);
            }

            existing.setMaintenanceStatus(requestedStatus);
        }

        // Only a manager/dept head/admin can reach this with a non-null
        // assignedTechnician (a technician either omits it or is blocked
        // above unless it's their own id, which is a no-op anyway).
        if (!isTechnician && updatedMaintenance.getAssignedTechnician() != null) {
            User assigned = userRepository.findById(
                            updatedMaintenance.getAssignedTechnician().getUserId())
                    .orElseThrow(() -> new RuntimeException("Assigned technician not found"));
            validateAssignedTechnician(assigned, existing.getEquipment());
            existing.setAssignedTechnician(assigned);
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

    private User getLoggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    private String getRole(User user) {
        return user.getRole() == null ? "" : user.getRole().getRoleName();
    }

    private boolean canManageEquipment(User user, String role, Equipment equipment) {
        if (equipment == null || user.getInstitution() == null || equipment.getInstitution() == null) {
            return false;
        }
        if ("INSTITUTION_ADMIN".equalsIgnoreCase(role)) {
            return user.getInstitution().getInstitutionId()
                    .equals(equipment.getInstitution().getInstitutionId());
        }
        if ("LAB_MANAGER".equalsIgnoreCase(role) || "LAB_TECHNICIAN".equalsIgnoreCase(role)) {
            return user.getDepartment() != null && equipment.getDepartment() != null
                    && user.getInstitution().getInstitutionId()
                            .equals(equipment.getInstitution().getInstitutionId())
                    && user.getDepartment().getDepartmentId()
                            .equals(equipment.getDepartment().getDepartmentId());
        }
        return "SYSTEM_ADMIN".equalsIgnoreCase(role);
    }

    private void assertCanManageEquipment(User user, String role, Equipment equipment) {
        if (!canManageEquipment(user, role, equipment)) {
            throw new RuntimeException("You can only manage maintenance for your permitted institution/department");
        }
    }

    private void validateAssignedTechnician(User assigned, Equipment equipment) {
        if (!"LAB_TECHNICIAN".equalsIgnoreCase(getRole(assigned))
                || assigned.getInstitution() == null
                || equipment == null
                || equipment.getInstitution() == null
                || !assigned.getInstitution().getInstitutionId()
                        .equals(equipment.getInstitution().getInstitutionId())
                || assigned.getDepartment() == null
                || equipment.getDepartment() == null
                || !assigned.getDepartment().getDepartmentId()
                        .equals(equipment.getDepartment().getDepartmentId())) {
            throw new RuntimeException("Technician must belong to the equipment's institution and department");
        }
    }

}