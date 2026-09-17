package com.example.lab_platform.service.impl;
 
import com.example.lab_platform.entity.Maintenance;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.MaintenanceRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.UserRepository;
import com.example.lab_platform.service.MaintenanceService;
import com.example.lab_platform.service.BookingService;
import com.example.lab_platform.service.NotificationService;

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
    private final NotificationService notificationService;
 
 
    public MaintenanceServiceImpl(
            MaintenanceRepository maintenanceRepository,
            EquipmentRepository equipmentRepository,
            BookingService bookingService,
            UserRepository userRepository,
            NotificationService notificationService) {
 
        this.maintenanceRepository = maintenanceRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingService = bookingService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
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
     * dates, status).
     *
     * Completion is a two-step, two-person flow: a technician marking
     * their task done moves it to "Pending Verification", and only a
     * Lab Manager (or admin) can then set "Completed" (verify) or
     * "Rejected" with a reason (send it back to be redone). The linked
     * equipment is released back to "Available" only on that manager
     * verification, and only if no other still-open maintenance record
     * exists for the same equipment.
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
            boolean requestingCompleted = requestedStatus.equalsIgnoreCase("Completed");
            boolean wasRejected = "Rejected".equalsIgnoreCase(existing.getMaintenanceStatus());
            boolean awaitingVerification =
                    PENDING_VERIFICATION.equalsIgnoreCase(existing.getMaintenanceStatus());

            if (requestingRejected) {
                // Only a Lab Manager (or System Admin) reviewing finished
                // work can reject it — a technician can never set this
                // status on their own task.
                if (isTechnician) {
                    throw new RuntimeException(
                            "Only a Lab Manager can reject submitted work");
                }
                if (!awaitingVerification) {
                    throw new RuntimeException(
                            "Only work submitted for verification can be rejected");
                }
                String reason = updatedMaintenance.getRejectionReason();
                if (reason == null || reason.trim().isEmpty()) {
                    throw new RuntimeException(
                            "A reason is required to reject submitted work");
                }
                existing.setRejectionReason(reason.trim());
                existing.setMaintenanceStatus(requestedStatus);
                notifyTechnicianOfReview(existing, false);

            } else if (requestingCompleted && isTechnician) {
                /*
                 * A technician never closes their own work order. Marking
                 * it done submits it to the Lab Manager for verification —
                 * the equipment stays Under Maintenance until a manager
                 * signs it off, so nothing gets released back to users on
                 * the technician's word alone.
                 */
                existing.setRejectionReason(null);
                existing.setMaintenanceStatus(PENDING_VERIFICATION);
                notifyManagersOfSubmission(existing);

            } else if (requestingCompleted) {
                /*
                 * A manager (or admin) setting Completed IS the
                 * verification step. Work that a technician submitted has
                 * to pass through here before the equipment is released.
                 */
                existing.setRejectionReason(null);
                existing.setMaintenanceStatus(requestedStatus);
                if (awaitingVerification) {
                    notifyTechnicianOfReview(existing, true);
                }

            } else {
                if (wasRejected) {
                    // The technician (or a manager) is moving the task on
                    // from "Rejected" — that's the redo being restarted, so
                    // the old reason no longer applies once it's acted on.
                    existing.setRejectionReason(null);
                }
                existing.setMaintenanceStatus(requestedStatus);
            }
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
                                || m.getMaintenanceStatus().equalsIgnoreCase("In Progress")
                                // Submitted by the technician but not yet
                                // signed off, or sent back to be redone —
                                // either way the work isn't finished, so the
                                // equipment stays out of service.
                                || m.getMaintenanceStatus().equalsIgnoreCase(PENDING_VERIFICATION)
                                || m.getMaintenanceStatus().equalsIgnoreCase("Rejected")));
 
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

    /*
     * The state a work order sits in between the technician saying
     * they're done and a Lab Manager actually verifying it. Equipment
     * is NOT released while a record is in this state.
     */
    static final String PENDING_VERIFICATION = "Pending Verification";

    /*
     * Technician submitted finished work — tell the Lab Managers in the
     * equipment's own department that there's something to verify.
     */
    private void notifyManagersOfSubmission(Maintenance maintenance) {

        Equipment equipment = maintenance.getEquipment();
        if (equipment == null || equipment.getInstitution() == null) {
            return;
        }

        String technicianName = maintenance.getAssignedTechnician() != null
                ? maintenance.getAssignedTechnician().getFullName()
                : "A technician";

        userRepository.findByRole_RoleNameAndInstitution_InstitutionId(
                        "LAB_MANAGER", equipment.getInstitution().getInstitutionId())
                .stream()
                .filter(manager -> equipment.getDepartment() != null
                        && manager.getDepartment() != null
                        && manager.getDepartment().getDepartmentId()
                                .equals(equipment.getDepartment().getDepartmentId()))
                .forEach(manager -> notificationService.create(
                        manager,
                        "MAINTENANCE_VERIFICATION_REQUIRED",
                        "Maintenance work awaiting your verification",
                        technicianName + " marked the maintenance on "
                                + equipment.getEquipmentName()
                                + " as done. Verify it or send it back before the equipment"
                                + " is released.",
                        maintenance.getMaintenanceId()));
    }

    /*
     * Manager finished reviewing — tell the assigned technician whether
     * their work was signed off or sent back.
     */
    private void notifyTechnicianOfReview(Maintenance maintenance, boolean verified) {

        User technician = maintenance.getAssignedTechnician();
        if (technician == null) {
            return;
        }

        String equipmentName = maintenance.getEquipment() != null
                ? maintenance.getEquipment().getEquipmentName()
                : "the equipment";

        notificationService.create(
                technician,
                verified ? "MAINTENANCE_VERIFIED" : "MAINTENANCE_REJECTED",
                verified
                        ? "Your maintenance work was verified"
                        : "Your maintenance work was sent back",
                verified
                        ? "Your work on " + equipmentName
                                + " was verified and the equipment has been released."
                        : "Your work on " + equipmentName + " needs redoing: "
                                + maintenance.getRejectionReason(),
                maintenance.getMaintenanceId());
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