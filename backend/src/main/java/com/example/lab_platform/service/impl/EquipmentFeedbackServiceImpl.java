package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.EquipmentFeedback;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.entity.Waitlist;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.repository.EquipmentFeedbackRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.UserRepository;
import com.example.lab_platform.repository.WaitlistRepository;
import com.example.lab_platform.service.BookingService;
import com.example.lab_platform.service.EquipmentFeedbackService;
import com.example.lab_platform.service.NotificationService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentFeedbackServiceImpl implements EquipmentFeedbackService {

    private final EquipmentFeedbackRepository feedbackRepository;
private final EquipmentRepository equipmentRepository;
private final BookingRepository bookingRepository;
private final WaitlistRepository waitlistRepository;
private final NotificationService notificationService;
private final BookingService bookingService;
private final UserRepository userRepository; // NEW

public EquipmentFeedbackServiceImpl(
        EquipmentFeedbackRepository feedbackRepository,
        EquipmentRepository equipmentRepository,
        BookingRepository bookingRepository,
        WaitlistRepository waitlistRepository,
        NotificationService notificationService,
        BookingService bookingService,
        UserRepository userRepository) { // NEW
    this.feedbackRepository = feedbackRepository;
    this.equipmentRepository = equipmentRepository;
    this.bookingRepository = bookingRepository;
    this.waitlistRepository = waitlistRepository;
    this.notificationService = notificationService;
    this.bookingService = bookingService;
    this.userRepository = userRepository; // NEW
}

    private User getLoggedInUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    @Override
    public List<EquipmentFeedback> getAllFeedback() {
        User user = getLoggedInUser();
        String role = getRole(user);
        return feedbackRepository.findAllByOrderByCreatedDateDesc().stream()
            .filter(feedback -> canManageEquipment(user, role, feedback.getEquipment()))
            .toList();
    }

    @Override
    public List<EquipmentFeedback> getMyFeedback() {
        User user = getLoggedInUser();
        return feedbackRepository.findByReportedBy_UserIdOrderByCreatedDateDesc(user.getUserId());
    }

    @Override
    public List<EquipmentFeedback> getFeedbackByEquipment(Integer equipmentId) {
        User user = getLoggedInUser();
        Equipment equipment = equipmentRepository.findById(equipmentId)
            .orElseThrow(() -> new RuntimeException("Equipment not found"));
        assertCanManageEquipment(user, getRole(user), equipment);
        return feedbackRepository.findByEquipment_EquipmentId(equipmentId);
    }

    @Override
    public EquipmentFeedback submitFeedback(EquipmentFeedback feedback) {
        if (feedback.getEquipment() == null || feedback.getEquipment().getEquipmentId() == null) {
            throw new RuntimeException("Equipment is required");
        }
        if (feedback.getDescription() == null || feedback.getDescription().isBlank()) {
            throw new RuntimeException("Description is required");
        }

        Equipment equipment = equipmentRepository.findById(feedback.getEquipment().getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        String urgency = feedback.getUrgency();
        if (urgency == null || (!urgency.equalsIgnoreCase("NORMAL") && !urgency.equalsIgnoreCase("URGENT"))) {
            urgency = "NORMAL";
        }
        urgency = urgency.toUpperCase();

        User currentUser = getLoggedInUser();

        // When the report comes from the inline action on a specific
        // booking (My Bookings → Actions column), validate ownership and
        // attach it. Two windows are allowed: while the booking is
        // actively "In Use" (no deadline — equipment is in front of them
        // right now), or within 1 hour after it's "Completed". A report
        // raised from the general Equipment page instead simply omits
        // booking and skips all of this.
        Booking booking = null;
        if (feedback.getBooking() != null && feedback.getBooking().getBookingId() != null) {
            booking = bookingRepository.findById(feedback.getBooking().getBookingId())
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            if (booking.getUser() == null || !booking.getUser().getUserId().equals(currentUser.getUserId())) {
                throw new RuntimeException("You can only submit feedback for your own booking");
            }
            if (booking.getEquipment() == null
                    || !booking.getEquipment().getEquipmentId().equals(equipment.getEquipmentId())) {
                throw new RuntimeException("Booking does not match the selected equipment");
            }

            boolean isInUse = "In Use".equals(booking.getBookingStatus());
            boolean isCompleted = "Completed".equals(booking.getBookingStatus());

            if (!isInUse && !isCompleted) {
                throw new RuntimeException(
                        "Feedback can only be submitted while the equipment is in use, "
                                + "or within 1 hour after the booking is completed");
            }

            // Only the post-completion path has a deadline — while a
            // booking is still "In Use" there's no window to enforce,
            // since the student is actively using the equipment right now.
            if (isCompleted && (booking.getEndTime() == null
                    || java.time.LocalDateTime.now().isAfter(booking.getEndTime().plusHours(1)))) {
                throw new RuntimeException("The 1-hour feedback window for this booking has closed");
            }

            if (feedbackRepository.existsByBooking_BookingId(booking.getBookingId())) {
                throw new RuntimeException("Feedback has already been submitted for this booking");
            }
        }

        // reportedBy is derived from the logged-in user, never trusted

        // from the request body.
        feedback.setEquipment(equipment);
        feedback.setReportedBy(currentUser);
        feedback.setBooking(booking);
        feedback.setUrgency(urgency);
        feedback.setStatus("PENDING");

        EquipmentFeedback saved = feedbackRepository.save(feedback);

// Tell the people who can actually fix it — scoped to the equipment's
// department (falling back to institution-wide techs/managers only if
// the equipment has no department set).
notifyTechsAndManagersOfNewFeedback(saved, equipment);

if ("URGENT".equals(urgency)) {
    addDisplacedBookingHoldersToPriorityWaitlist(equipment);
}

return saved;
    }

    /*
     * Finds every user with a Pending Approval or Confirmed booking on
     * this equipment and, unless they already have an active waitlist
     * entry for it, adds them as a priority (isPriority = true) entry
     * carrying their original booking's time window. They're notified
     * so they know why — the booking itself is left untouched here;
     * createBooking()/approveBooking() are what actually block on the
     * urgent issue going forward.
     */
    private void addDisplacedBookingHoldersToPriorityWaitlist(Equipment equipment) {

        List<Booking> activeBookings =
                bookingRepository.findActiveBookingsForEquipment(equipment.getEquipmentId());

        for (Booking booking : activeBookings) {

            User user = booking.getUser();
            if (user == null) {
                continue;
            }

            boolean alreadyOnWaitlist =
                    waitlistRepository.existsByUser_UserIdAndEquipment_EquipmentIdAndWaitlistStatusIn(
                            user.getUserId(),
                            equipment.getEquipmentId(),
                            List.of("WAITING", "NOTIFIED")
                    );

            if (alreadyOnWaitlist) {
                continue;
            }

            Waitlist entry = new Waitlist();
            entry.setUser(user);
            entry.setEquipment(equipment);
            entry.setRequestedStartTime(booking.getStartTime());
            entry.setRequestedEndTime(booking.getEndTime());
            entry.setWaitlistStatus("WAITING");
            entry.setIsPriority(true);
            // Priority order key: the system date they actually made the
            // reservation, not the usage start time they requested.
            entry.setQueueDate(booking.getBookingDate());

            waitlistRepository.save(entry);

            notificationService.create(
                    user,
                    "EQUIPMENT_ISSUE_REPORTED",
                    "Urgent issue reported on " + equipment.getEquipmentName(),
                    "An unresolved urgent issue was reported on " + equipment.getEquipmentName()
                            + ", which your booking depends on. You've been added to the priority "
                            + "waitlist and will be notified once it's resolved.",
                    equipment.getEquipmentId()
            );
        }
    }

    @Override
    public EquipmentFeedback updateStatus(Integer id, String status) {
        EquipmentFeedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
        User user = getLoggedInUser();
        assertCanManageEquipment(user, getRole(user), feedback.getEquipment());

        String normalized = status == null ? "" : status.trim().toUpperCase();
        if (!normalized.equals("REVIEWED") && !normalized.equals("RESOLVED")) {
            throw new RuntimeException("Status must be REVIEWED or RESOLVED");
        }

        feedback.setStatus(normalized);
        EquipmentFeedback saved = feedbackRepository.save(feedback);

        if ("RESOLVED".equals(normalized) && "URGENT".equalsIgnoreCase(feedback.getUrgency())) {
            notifyWaitlistOfResolutionAndCascade(feedback.getEquipment());
        }

        return saved;
    }

    /*
     * Notifies everyone currently active on this equipment's waitlist
     * that the urgent issue is resolved, then runs the waitlist
     * cascade (priority entries first, earliest original booking date
     * within that group) so displaced booking-holders and ordinary
     * waitlisters are told their slot is free again. Nobody is booked
     * automatically — each user books the slot themselves.
     */
    private void notifyWaitlistOfResolutionAndCascade(Equipment equipment) {

        if (equipment == null) {
            return;
        }

        List<Waitlist> activeEntries =
                waitlistRepository
                        .findByEquipment_EquipmentIdAndWaitlistStatusInOrderByIsPriorityDescQueueDateAscCreatedAtAsc(
                                equipment.getEquipmentId(),
                                List.of("WAITING", "NOTIFIED")
                        );

        for (Waitlist entry : activeEntries) {

            notificationService.create(
                    entry.getUser(),
                    "EQUIPMENT_ISSUE_RESOLVED",
                    "Issue resolved on " + equipment.getEquipmentName(),
                    "The urgent issue on " + equipment.getEquipmentName()
                            + " has been resolved. If your original slot is still free it will be "
                            + "booked automatically; otherwise you're welcome to book a new slot.",
                    equipment.getEquipmentId()
            );
        }

        bookingService.processWaitlistForEquipment(equipment.getEquipmentId());
    }

    private void notifyTechsAndManagersOfNewFeedback(EquipmentFeedback feedback, Equipment equipment) {
    // Prefer department-level scoping so only the relevant department's
    // staff are paged, and include Department Head alongside the
    // technician/manager pair that were already being notified. Falls
    // back to institution-wide tech+manager (no dept head — there's no
    // single dept head for a whole institution) only if this equipment
    // has no department assigned.
    List<User> recipients;
    if (equipment.getDepartment() != null) {
        recipients = userRepository
                .findByDepartment_DepartmentId(equipment.getDepartment().getDepartmentId())
                .stream()
                .filter(u -> u.getRole() != null
                        && ("LAB_TECHNICIAN".equalsIgnoreCase(u.getRole().getRoleName())
                            || "LAB_MANAGER".equalsIgnoreCase(u.getRole().getRoleName())
                            || "DEPARTMENT_HEAD".equalsIgnoreCase(u.getRole().getRoleName())))
                .toList();
    } else if (equipment.getInstitution() != null) {
        recipients = userRepository
                .findByInstitution_InstitutionId(equipment.getInstitution().getInstitutionId())
                .stream()
                .filter(u -> u.getRole() != null
                        && ("LAB_TECHNICIAN".equalsIgnoreCase(u.getRole().getRoleName())
                            || "LAB_MANAGER".equalsIgnoreCase(u.getRole().getRoleName())))
                .toList();
    } else {
        // EDGE CASE: equipment with no department and no institution — nobody to notify
        return;
    }

    boolean urgent = "URGENT".equalsIgnoreCase(feedback.getUrgency());
    String title = urgent ? "Urgent issue reported" : "Equipment issue reported";
    String message = equipment.getEquipmentName() + ": " + feedback.getDescription();

    for (User u : recipients) {
        notificationService.create(u, "EQUIPMENT_FEEDBACK_REPORTED", title, message, feedback.getFeedbackId());
    }
}

    @Override
    public EquipmentFeedback markAsFixed(Integer id) {
        EquipmentFeedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        User user = getLoggedInUser();
        assertCanManageEquipment(user, getRole(user), feedback.getEquipment());
        if (!"LAB_TECHNICIAN".equalsIgnoreCase(getRole(user))) {
            throw new RuntimeException("Only the assigned lab technician can mark an issue as fixed");
        }
        if (feedback.getEquipment() == null || feedback.getEquipment().getDepartment() == null
                || user.getDepartment() == null
                || !feedback.getEquipment().getDepartment().getDepartmentId()
                        .equals(user.getDepartment().getDepartmentId())) {
            throw new RuntimeException("You can only fix issues for your department");
        }
        feedback.setHandledBy(user);
        feedback.setStatus("PENDING_APPROVAL");
        EquipmentFeedback saved = feedbackRepository.save(feedback);

        // Notify managers that technician completed the fix and requested review
        if (feedback.getEquipment() != null && feedback.getEquipment().getInstitution() != null) {
            List<User> managers = userRepository
                    .findByInstitution_InstitutionId(feedback.getEquipment().getInstitution().getInstitutionId())
                    .stream()
                    .filter(u -> u.getRole() != null && "LAB_MANAGER".equalsIgnoreCase(u.getRole().getRoleName()))
                    .toList();
            for (User mgr : managers) {
                notificationService.create(
                        mgr,
                        "EQUIPMENT_FIX_SUBMITTED",
                        "Fix submitted for " + feedback.getEquipment().getEquipmentName(),
                        user.getFullName() + " marked issue #" + id + " on " + feedback.getEquipment().getEquipmentName() + " as fixed. Review and verify.",
                        feedback.getFeedbackId()
                );
            }
        }
        return saved;
    }

    @Override
    public EquipmentFeedback decideOnFix(Integer id, String decision) {
        EquipmentFeedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
        User user = getLoggedInUser();
        assertCanManageEquipment(user, getRole(user), feedback.getEquipment());

        String normalized = decision == null ? "" : decision.trim().toUpperCase();
        if (!normalized.equals("RESOLVED") && !normalized.equals("REJECTED")) {
            throw new RuntimeException("Decision must be RESOLVED or REJECTED");
        }

        feedback.setStatus(normalized);
        EquipmentFeedback saved = feedbackRepository.save(feedback);

        if ("RESOLVED".equals(normalized)) {
            if ("URGENT".equalsIgnoreCase(feedback.getUrgency())) {
                notifyWaitlistOfResolutionAndCascade(feedback.getEquipment());
            }
            // Notify the student/researcher who reported it
            if (feedback.getReportedBy() != null) {
                notificationService.create(
                        feedback.getReportedBy(),
                        "EQUIPMENT_ISSUE_RESOLVED",
                        "Your reported issue on " + feedback.getEquipment().getEquipmentName() + " has been resolved",
                        "The issue you reported on " + feedback.getEquipment().getEquipmentName() + " has been verified and resolved.",
                        feedback.getEquipment().getEquipmentId()
                );
            }
        } else if ("REJECTED".equals(normalized) && feedback.getHandledBy() != null) {
            notificationService.create(
                    feedback.getHandledBy(),
                    "EQUIPMENT_FIX_REJECTED",
                    "Fix rejected for " + feedback.getEquipment().getEquipmentName(),
                    "The fix for issue #" + id + " was not approved. Please re-examine the equipment.",
                    feedback.getFeedbackId()
            );
        }

        return saved;
    }

    private String getRole(User user) {
        return user.getRole() == null ? "" : user.getRole().getRoleName();
    }

    private boolean canManageEquipment(User user, String role, Equipment equipment) {
        if (equipment == null || user.getInstitution() == null || equipment.getInstitution() == null) {
            return false;
        }
        if ("SYSTEM_ADMIN".equalsIgnoreCase(role)) return true;
        if (!user.getInstitution().getInstitutionId()
                .equals(equipment.getInstitution().getInstitutionId())) return false;
        if ("INSTITUTION_ADMIN".equalsIgnoreCase(role)) return true;
        return ("LAB_MANAGER".equalsIgnoreCase(role)
                || "LAB_TECHNICIAN".equalsIgnoreCase(role))
                && user.getDepartment() != null
                && equipment.getDepartment() != null
                && user.getDepartment().getDepartmentId()
                        .equals(equipment.getDepartment().getDepartmentId());
    }

    private void assertCanManageEquipment(User user, String role, Equipment equipment) {
        if (!canManageEquipment(user, role, equipment)) {
            throw new RuntimeException("You can only manage issue reports for your permitted institution/department");
        }
    }

    @Override
public List<Integer> getUrgentUnresolvedEquipmentIds() {
    // Deliberately no role/ownership check beyond being logged in —
    // this only ever returns bare equipment IDs, never feedback
    // content, so it's safe for any booking-capable role (including
    // STUDENT) to call from the booking form.
    return feedbackRepository.findEquipmentIdsWithUnresolvedUrgentIssue("URGENT", "RESOLVED");
}

@Override
public List<Integer> getUnresolvedEquipmentIds() {
    // Same no-check reasoning as above — bare IDs only. Every
    // unresolved report blocks booking now, not just URGENT ones, so
    // this is what the Equipment list page uses to flag a card.
    return feedbackRepository.findEquipmentIdsWithUnresolvedIssue("RESOLVED");
}
}