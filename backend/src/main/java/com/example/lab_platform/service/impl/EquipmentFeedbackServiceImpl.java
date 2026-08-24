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
        return feedbackRepository.findAll();
    }

    @Override
    public List<EquipmentFeedback> getFeedbackByEquipment(Integer equipmentId) {
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

        // reportedBy is derived from the logged-in user, never trusted
        // from the request body.
        feedback.setEquipment(equipment);
        feedback.setReportedBy(getLoggedInUser());
        feedback.setUrgency(urgency);
        feedback.setStatus("PENDING");

        EquipmentFeedback saved = feedbackRepository.save(feedback);

// NEW: tell the people who can actually fix it. Previously nothing
// notified a technician/manager that an issue was even reported —
// only the URGENT path notified displaced booking-holders, not the
// people responsible for resolving it.
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
     * that the urgent issue is resolved, then runs the allocation
     * cascade (priority entries first, earliest original booking date
     * within that group) so displaced booking-holders and ordinary
     * waitlisters get auto-booked into their requested slot wherever
     * it's still free. Anyone not auto-fulfilled just stays on the
     * waitlist and can book manually like any other user.
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
    // EDGE CASE: equipment with no institution set — nobody to notify
    if (equipment.getInstitution() == null) return;

    List<User> recipients = userRepository
            .findByInstitution_InstitutionId(equipment.getInstitution().getInstitutionId())
            .stream()
            .filter(u -> u.getRole() != null
                    && ("LAB_TECHNICIAN".equalsIgnoreCase(u.getRole().getRoleName())
                        || "LAB_MANAGER".equalsIgnoreCase(u.getRole().getRoleName())))
            .toList();

    boolean urgent = "URGENT".equalsIgnoreCase(feedback.getUrgency());
    String title = urgent ? "Urgent issue reported" : "Equipment issue reported";
    String message = equipment.getEquipmentName() + ": " + feedback.getDescription();

    for (User u : recipients) {
        notificationService.create(u, "EQUIPMENT_FEEDBACK_REPORTED", title, message, feedback.getFeedbackId());
    }
}
}