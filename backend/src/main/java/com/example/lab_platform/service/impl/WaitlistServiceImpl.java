package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.entity.Waitlist;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.WaitlistRepository;
import com.example.lab_platform.service.WaitlistService;
import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.entity.Maintenance;
import com.example.lab_platform.repository.MaintenanceRepository;
import com.example.lab_platform.repository.EquipmentFeedbackRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WaitlistServiceImpl implements WaitlistService {

    private final WaitlistRepository waitlistRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final EquipmentFeedbackRepository equipmentFeedbackRepository;

    public WaitlistServiceImpl(WaitlistRepository waitlistRepository,
                                EquipmentRepository equipmentRepository,
                                BookingRepository bookingRepository,
                                MaintenanceRepository maintenanceRepository,
                                EquipmentFeedbackRepository equipmentFeedbackRepository) {
        this.waitlistRepository = waitlistRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.equipmentFeedbackRepository = equipmentFeedbackRepository;
    }
private String getRole(User user) {
    return user.getRole().getRoleName();
}

private boolean isManagerOrAbove(String role) {
    return role.equalsIgnoreCase("LAB_MANAGER")
            || role.equalsIgnoreCase("DEPARTMENT_HEAD")
            || role.equalsIgnoreCase("INSTITUTION_ADMIN")
            || role.equalsIgnoreCase("SYSTEM_ADMIN");
}

// Mirrors BookingServiceImpl.assertSameInstitutionAsEquipment — a
// manager-tier caller may only act on a waitlist entry for equipment
// in their own institution (Institution Admin) or their own
// institution AND department (Lab Manager/Department Head).
// System Admin is unrestricted.
private void assertSameInstitutionAsEquipment(User loggedInUser, String role, Equipment equipment) {
    if ("SYSTEM_ADMIN".equalsIgnoreCase(role)) {
        return;
    }

    if (loggedInUser.getInstitution() == null
            || equipment.getInstitution() == null
            || !loggedInUser.getInstitution().getInstitutionId()
                    .equals(equipment.getInstitution().getInstitutionId())) {

        throw new RuntimeException(
                "You can only manage waitlist entries for your own institution's equipment");
    }

    if (!"INSTITUTION_ADMIN".equalsIgnoreCase(role)) {

        if (loggedInUser.getDepartment() == null
                || equipment.getDepartment() == null
                || !loggedInUser.getDepartment().getDepartmentId()
                        .equals(equipment.getDepartment().getDepartmentId())) {

            throw new RuntimeException(
                    "You can only manage waitlist entries for your own department's equipment");
        }
    }
}

    private User getLoggedInUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    @Override
public Waitlist joinWaitlist(Waitlist waitlist) {
    User loggedInUser = getLoggedInUser();
    waitlist.setUser(loggedInUser);

    if (waitlist.getEquipment() == null || waitlist.getEquipment().getEquipmentId() == null) {
        throw new RuntimeException("Equipment must be specified to join a waitlist");
    }

    if (waitlist.getRequestedStartTime() == null || waitlist.getRequestedEndTime() == null) {
        throw new RuntimeException("Requested start and end time are required");
    }

    if (!waitlist.getRequestedEndTime().isAfter(waitlist.getRequestedStartTime())) {
        throw new RuntimeException("End time must be after start time");
    }

    Integer equipmentId = waitlist.getEquipment().getEquipmentId();

    Equipment equipment = equipmentRepository.findById(equipmentId)
            .orElseThrow(() -> new RuntimeException("Equipment not found"));

    waitlist.setEquipment(equipment);

    boolean duplicateEntry =
            waitlistRepository
                    .existsByUser_UserIdAndEquipment_EquipmentIdAndRequestedStartTimeAndRequestedEndTimeAndWaitlistStatusIn(
                            loggedInUser.getUserId(),
                            equipmentId,
                            waitlist.getRequestedStartTime(),
                            waitlist.getRequestedEndTime(),
                            List.of("WAITING", "NOTIFIED")
                    );

    if (duplicateEntry) {
        throw new RuntimeException("You already have an active waitlist entry for this equipment and time window");
    }

    List<Booking> overlapping = bookingRepository.findOverlappingBookings(
            equipmentId,
            waitlist.getRequestedStartTime(),
            waitlist.getRequestedEndTime()
    );

    boolean underMaintenance = isUnderMaintenanceDuring(
            equipmentId,
            waitlist.getRequestedStartTime(),
            waitlist.getRequestedEndTime()
    );

    boolean hasUnresolvedIssue =
            equipmentFeedbackRepository.existsByEquipment_EquipmentIdAndStatusNot(
                    equipmentId, "RESOLVED"
            );

    boolean unavailable = !overlapping.isEmpty()
            || underMaintenance
            || hasUnresolvedIssue
            || !"Available".equalsIgnoreCase(equipment.getStatus());

    if (!unavailable) {
        throw new RuntimeException("Equipment is available for the selected time. Please create a booking instead.");
    }

    waitlist.setWaitlistStatus("WAITING");
    waitlist.setQueueDate(LocalDate.now());
    return waitlistRepository.save(waitlist);
}

    /*
     * Same maintenance-blocking rule as BookingServiceImpl —
     * a Scheduled or Active maintenance record on a date within
     * the requested window disqualifies the equipment.
     */
    private boolean isUnderMaintenanceDuring(Integer equipmentId,
                                              LocalDateTime start,
                                              LocalDateTime end) {

        List<Maintenance> maintenanceList =
                maintenanceRepository.findByEquipment_EquipmentId(equipmentId);

        for (Maintenance maintenance : maintenanceList) {

            String status = maintenance.getMaintenanceStatus();
            if (status == null) {
                continue;
            }

            boolean blocksBooking =
                    status.equalsIgnoreCase("Scheduled")
                            || status.equalsIgnoreCase("Active");

            if (!blocksBooking || maintenance.getMaintenanceDate() == null) {
                continue;
            }

            java.time.LocalDate maintenanceDate = maintenance.getMaintenanceDate();

            if (!maintenanceDate.isBefore(start.toLocalDate())
                    && !maintenanceDate.isAfter(end.toLocalDate())) {
                return true;
            }
        }

        return false;
    }

    /*
     * Staff view of the waitlist. SYSTEM_ADMIN sees everything. Lab
     * Manager sees only the ACTIVE entries (not cancelled ones) for
     * equipment owned by their own institution AND department, so they
     * can see who is waiting on their department's equipment.
     */
    private List<Waitlist> scopeForStaff(List<Waitlist> entries) {
        User loggedInUser = getLoggedInUser();
        String role = getRole(loggedInUser);

        if ("SYSTEM_ADMIN".equalsIgnoreCase(role)) {
            return entries;
        }

        if (loggedInUser.getInstitution() == null || loggedInUser.getDepartment() == null) {
            return new java.util.ArrayList<>();
        }

        Integer institutionId = loggedInUser.getInstitution().getInstitutionId();
        Integer departmentId = loggedInUser.getDepartment().getDepartmentId();

        return entries.stream()
                .filter(w -> w.getEquipment() != null
                        && w.getEquipment().getInstitution() != null
                        && institutionId.equals(w.getEquipment().getInstitution().getInstitutionId())
                        && w.getEquipment().getDepartment() != null
                        && departmentId.equals(w.getEquipment().getDepartment().getDepartmentId()))
                .filter(w -> !"CANCELLED".equalsIgnoreCase(w.getWaitlistStatus()))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<Waitlist> getAllWaitlistEntries() {
        return scopeForStaff(waitlistRepository.findAll());
    }

    @Override
    public List<Waitlist> getWaitlistForEquipment(Integer equipmentId) {
        return scopeForStaff(waitlistRepository.findByEquipment_EquipmentId(equipmentId));
    }

    @Override
    public List<Waitlist> getMyWaitlistEntries() {
        User loggedInUser = getLoggedInUser();
        return waitlistRepository.findByUser_UserId(loggedInUser.getUserId());
    }
@Override
   public void cancelWaitlistEntry(Integer waitlistId) {
    Waitlist entry = waitlistRepository.findById(waitlistId)
            .orElseThrow(() -> new RuntimeException("Waitlist entry not found"));

    User loggedInUser = getLoggedInUser();
    String role = getRole(loggedInUser);

    boolean isOwnEntry = entry.getUser().getUserId().equals(loggedInUser.getUserId());

    if (!isOwnEntry && !isManagerOrAbove(role)) {
        throw new RuntimeException("You can only cancel your own waitlist entry");
    }

    if (!isOwnEntry && entry.getEquipment() != null) {
        assertSameInstitutionAsEquipment(loggedInUser, role, entry.getEquipment());
    }

    entry.setWaitlistStatus("CANCELLED");
    waitlistRepository.save(entry);
}

@Override
public Waitlist decideOnMissedWindow(Integer waitlistId, String decision) {
    Waitlist entry = waitlistRepository.findById(waitlistId)
            .orElseThrow(() -> new RuntimeException("Waitlist entry not found"));

    User loggedInUser = getLoggedInUser();

    boolean isOwnEntry = entry.getUser().getUserId().equals(loggedInUser.getUserId());
    if (!isOwnEntry) {
        throw new RuntimeException("You can only decide on your own waitlist entry");
    }

    if (!"AWAITING_DECISION".equals(entry.getWaitlistStatus())) {
        throw new RuntimeException("This entry is no longer awaiting a decision");
    }

    if (decision == null) {
        throw new RuntimeException("decision is required (REBOOK or EXIT)");
    }

    String normalized = decision.toUpperCase();
    if (!normalized.equals("REBOOK") && !normalized.equals("EXIT")) {
        throw new RuntimeException("decision must be REBOOK or EXIT");
    }

    // Both outcomes close the entry the same way — CANCELLED. Whether
    // the user picks REBOOK (they'll rejoin the waitlist / book a
    // fresh slot for this equipment — the frontend handles sending
    // them there) or EXIT (they're done with this equipment), this
    // entry itself is finished either way. No separate "rejected"
    // status: Cancelled is the one terminal status for every way a
    // waitlist entry can end, matching the timeout sweep in
    // EquipmentStatusScheduler too.
    entry.setWaitlistStatus("CANCELLED");

    return waitlistRepository.save(entry);
}
}