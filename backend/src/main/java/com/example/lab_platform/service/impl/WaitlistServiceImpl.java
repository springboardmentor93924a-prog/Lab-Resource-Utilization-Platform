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

    boolean hasUrgentUnresolvedIssue =
            equipmentFeedbackRepository.existsByEquipment_EquipmentIdAndUrgencyAndStatusNot(
                    equipmentId, "URGENT", "RESOLVED"
            );

    boolean unavailable = !overlapping.isEmpty()
            || underMaintenance
            || hasUrgentUnresolvedIssue
            || !"Available".equalsIgnoreCase(equipment.getStatus());

    if (!unavailable) {
        throw new RuntimeException("Equipment is available for the selected time. Please create a booking instead.");
    }

    Equipment substitute = findIdleSubstitute(equipment, waitlist);

    if (substitute != null) {
        Booking autoBooking = new Booking();
        autoBooking.setUser(loggedInUser);
        autoBooking.setEquipment(substitute);
        /*
         * bookingDate is the system date this reservation was actually
         * made (right now) — the user is submitting THIS request at
         * this very moment, and it's being fulfilled synchronously in
         * the same call, so "now" IS the submission date here. This is
         * different from BookingServiceImpl.tryAutoAllocate(), which
         * runs later (via the cascade) and must use the ORIGINAL
         * queueDate instead — see that file for why.
         */
        autoBooking.setBookingDate(LocalDate.now());
        autoBooking.setStartTime(waitlist.getRequestedStartTime());
        autoBooking.setEndTime(waitlist.getRequestedEndTime());
        autoBooking.setPurpose("Auto-assigned idle substitute (schedule optimization)");
        autoBooking.setBookingStatus("Confirmed");
        bookingRepository.save(autoBooking);

        substitute.setStatus("Booked");
        equipmentRepository.save(substitute);

        waitlist.setWaitlistStatus("FULFILLED");
        return waitlistRepository.save(waitlist);
    }

    waitlist.setWaitlistStatus("WAITING");
    waitlist.setQueueDate(LocalDate.now());
    return waitlistRepository.save(waitlist);
}

    /*
     * Looks for an idle (Available) equipment of the same category
     * that is free for the requested window, excluding the originally
     * requested equipment itself.
     */
    private Equipment findIdleSubstitute(Equipment requestedEquipment, Waitlist waitlist) {
        if (waitlist.getRequestedStartTime() == null || waitlist.getRequestedEndTime() == null) {
            return null;
        }

        if (requestedEquipment.getCategory() == null) {
            return null;
        }

        List<Equipment> candidates = equipmentRepository.findByCategoryAndStatus(
                requestedEquipment.getCategory(), "Available"
        );

        for (Equipment candidate : candidates) {
            if (candidate.getEquipmentId().equals(requestedEquipment.getEquipmentId())) {
                continue;
            }
            List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                    candidate.getEquipmentId(),
                    waitlist.getRequestedStartTime(),
                    waitlist.getRequestedEndTime()
            );

            boolean underMaintenance = isUnderMaintenanceDuring(
                    candidate.getEquipmentId(),
                    waitlist.getRequestedStartTime(),
                    waitlist.getRequestedEndTime()
            );

            /*
             * Same live urgent-feedback check as BookingServiceImpl.
             * A candidate substitute with an unresolved URGENT report
             * must never be silently auto-assigned.
             */
            boolean hasUrgentUnresolvedIssue =
                    equipmentFeedbackRepository.existsByEquipment_EquipmentIdAndUrgencyAndStatusNot(
                            candidate.getEquipmentId(), "URGENT", "RESOLVED"
                    );

            if (overlapping.isEmpty() && !underMaintenance && !hasUrgentUnresolvedIssue) {
                return candidate;
            }
        }

        return null;
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

    @Override
    public List<Waitlist> getAllWaitlistEntries() {
        return waitlistRepository.findAll();
    }

    @Override
    public List<Waitlist> getWaitlistForEquipment(Integer equipmentId) {
        return waitlistRepository.findByEquipment_EquipmentId(equipmentId);
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

    entry.setWaitlistStatus("CANCELLED");
    waitlistRepository.save(entry);
}
}