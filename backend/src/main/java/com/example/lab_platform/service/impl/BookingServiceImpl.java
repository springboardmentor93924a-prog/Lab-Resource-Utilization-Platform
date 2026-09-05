package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.repository.EquipmentFeedbackRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.service.BookingService;
import com.example.lab_platform.entity.Waitlist;
import com.example.lab_platform.repository.WaitlistRepository;
import com.example.lab_platform.entity.Maintenance;
import com.example.lab_platform.repository.MaintenanceRepository;
import com.example.lab_platform.repository.ResourceSharingRepository;
import com.example.lab_platform.repository.UserRepository;
import com.example.lab_platform.service.NotificationService;
import com.example.lab_platform.service.RealtimeUpdateService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final WaitlistRepository waitlistRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final ResourceSharingRepository resourceSharingRepository;
    private final EquipmentFeedbackRepository equipmentFeedbackRepository;
    private final NotificationService notificationService;
        private final UserRepository userRepository;
        private final RealtimeUpdateService realtimeUpdateService;

public BookingServiceImpl(
        BookingRepository bookingRepository,
        EquipmentRepository equipmentRepository,
        WaitlistRepository waitlistRepository,
        MaintenanceRepository maintenanceRepository,
        ResourceSharingRepository resourceSharingRepository,
        EquipmentFeedbackRepository equipmentFeedbackRepository,
        NotificationService notificationService,
        UserRepository userRepository,
        RealtimeUpdateService realtimeUpdateService) {

    this.bookingRepository = bookingRepository;
    this.equipmentRepository = equipmentRepository;
    this.waitlistRepository = waitlistRepository;
    this.maintenanceRepository = maintenanceRepository;
    this.resourceSharingRepository = resourceSharingRepository;
    this.equipmentFeedbackRepository = equipmentFeedbackRepository;
    this.notificationService = notificationService;
        this.userRepository = userRepository;
        this.realtimeUpdateService = realtimeUpdateService;
}
    
    /*
     * Thin wrapper kept so the existing call sites (rejectBooking,
     * completeBooking, autoCompleteOverdueBookings) don't need to
     * change — delegates to the full cascade below instead of only
     * ever looking at a single entry. Also doubles as the real-time
     * push point: every one of those call sites just changed the
     * equipment's status to Available, so this is a natural single
     * place to ping connected clients from.
     */
    private void notifyNextWaitlistedUser(Equipment equipment) {
        if (equipment == null) {
            return;
        }
        realtimeUpdateService.pingEquipmentUpdated();
        processWaitlistForEquipment(equipment.getEquipmentId());
    }

    /*
     * Runs the full waitlist cascade for one equipment: every active
     * (WAITING/NOTIFIED) entry is considered, priority entries
     * (displaced booking-holders from an urgent-report auto-add)
     * first, then earliest requested start time within each group.
     * Each entry is tried independently against its OWN requested
     * window — different entries can have non-overlapping windows
     * and all get fulfilled in the same pass, since this isn't a
     * single-slot lock, it's per-entry availability.
     *
     * This is also the fix for the old single-shot bug: previously
     * only the single oldest WAITING entry was ever looked at, and if
     * it couldn't be allocated the entry was marked NOTIFIED with no
     * real notification sent and no fallback to the next person in
     * line — the whole waitlist for that equipment silently stalled.
     * Now every active entry is walked in order every time this runs
     * — if entry #1 can't be fitted, #2, #3, etc. still get their
     * shot in the same pass. Nobody blocks anybody behind them.
     */
    @Override
    public void processWaitlistForEquipment(Integer equipmentId) {

        if (equipmentId == null) {
            return;
        }

        Equipment equipment =
                equipmentRepository.findById(equipmentId).orElse(null);

        if (equipment == null) {
            return;
        }

        List<Waitlist> activeEntries =
                waitlistRepository
                        .findByEquipment_EquipmentIdAndWaitlistStatusInOrderByIsPriorityDescQueueDateAscCreatedAtAsc(
                                equipmentId,
                                List.of("WAITING", "NOTIFIED")
                        );

        for (Waitlist entry : activeEntries) {

            // NEW: if this entry's requested window has already passed,
            // tryAutoAllocate below will refuse it forever (its own
            // start-in-the-past check never stops being true) — so
            // instead of silently cycling it through the generic
            // "couldn't allocate right now" path indefinitely, notify
            // the person and let them choose: book a fresh slot, or
            // exit the waitlist. See WaitlistServiceImpl.decideOnMissedWindow
            // for the two-button response, and
            // EquipmentStatusScheduler.expireUndecidedWaitlistEntries()
            // for the timeout if they never decide.
            if (entry.getRequestedStartTime() != null
                    && entry.getRequestedStartTime().isBefore(LocalDateTime.now())) {

                if (!"AWAITING_DECISION".equals(entry.getWaitlistStatus())) {
                    entry.setWaitlistStatus("AWAITING_DECISION");
                    waitlistRepository.save(entry);

                    notificationService.create(
                            entry.getUser(),
                            "WAITLIST_MISSED_WINDOW",
                            "Couldn't allocate your waitlist slot",
                            "We checked and couldn't allocate " + equipment.getEquipmentName()
                                    + " — your requested time already passed. Book another slot, or "
                                    + "exit the waitlist, before "
                                    + entry.getRequestedEndTime() + ".",
                            equipment.getEquipmentId()
                    );
                }

                continue;
            }

            boolean allocated = tryAutoAllocate(entry, equipment);

            if (allocated) {

                entry.setWaitlistStatus("FULFILLED");
                waitlistRepository.save(entry);

                // tryAutoAllocate() now respects equipment.requiresApproval,
                // so the resulting booking may be Pending Approval rather
                // than Confirmed — reflect that accurately instead of
                // always claiming it's confirmed.
                boolean requiresApproval = equipment.getRequiresApproval() == null
                        || equipment.getRequiresApproval();

                notificationService.create(
                        entry.getUser(),
                        "WAITLIST_FULFILLED",
                        requiresApproval
                                ? "Your waitlisted slot is awaiting approval"
                                : "Your waitlisted slot is booked",
                        requiresApproval
                                ? "Your requested slot for " + equipment.getEquipmentName()
                                        + " has been submitted and is now awaiting manager approval."
                                : "Your requested slot for " + equipment.getEquipmentName()
                                        + " is now confirmed.",
                        equipment.getEquipmentId()
                );

            } else if (!"NOTIFIED".equals(entry.getWaitlistStatus())) {

                // Checked and couldn't be allocated right now — stays
                // in the queue and gets reconsidered next time this
                // equipment frees up or an urgent issue/calibration on
                // it resolves. The loop keeps going to the next entry
                // regardless of this outcome.
                entry.setWaitlistStatus("NOTIFIED");
                waitlistRepository.save(entry);
            }
        }
    }

    private boolean tryAutoAllocate(
            Waitlist entry,
            Equipment equipment) {

        LocalDateTime start =
                entry.getRequestedStartTime();

        LocalDateTime end =
                entry.getRequestedEndTime();

        if (start == null || end == null) {
            return false;
        }

        if (!end.isAfter(start)
                || start.isBefore(LocalDateTime.now())) {

            return false;
        }

        List<Booking> overlapping =
                bookingRepository.findOverlappingBookings(
                        equipment.getEquipmentId(),
                        start,
                        end
                );

        if (!overlapping.isEmpty()) {
            return false;
        }

        if (isUnderMaintenanceDuring(
                equipment.getEquipmentId(),
                start,
                end)) {

            return false;
        }

        /*
         * Same live urgent-feedback check as createBooking()/
         * approveBooking(). Without this, a waitlisted student could
         * get silently auto-booked onto equipment that still has an
         * unresolved URGENT report, with no error shown to anyone
         * since this path never goes through createBooking().
         */
        if (equipmentFeedbackRepository.existsByEquipment_EquipmentIdAndUrgencyAndStatusNot(
                equipment.getEquipmentId(), "URGENT", "RESOLVED")) {

            return false;
        }

        Booking autoBooking = new Booking();

        autoBooking.setUser(entry.getUser());
        autoBooking.setEquipment(equipment);
        /*
         * bookingDate is the system date the user actually SUBMITTED
         * their request — for a waitlist entry that's the date they
         * joined the waitlist (or, for a priority entry auto-added
         * from a displaced booking, that original booking's own
         * bookingDate), which is exactly what Waitlist.queueDate
         * already holds. It is NOT the date this cascade happens to
         * run (that could be days later) and NOT the requested usage
         * start date. Falls back to today only in the defensive case
         * queueDate was somehow never set.
         */
        autoBooking.setBookingDate(
                entry.getQueueDate() != null
                        ? entry.getQueueDate()
                        : java.time.LocalDate.now()
        );
        autoBooking.setStartTime(start);
        autoBooking.setEndTime(end);
        autoBooking.setPurpose("Auto-allocated from waitlist");

        /*
         * Waitlist fulfillment must respect the SAME approval rule as
         * a normal createBooking() request — being auto-allocated from
         * the waitlist is not a bypass for equipment that requires a
         * manager's sign-off before use. Previously this always went
         * straight to "Confirmed" regardless of requiresApproval,
         * which let a waitlisted student get scheduled onto
         * approval-required equipment with nobody ever reviewing it.
         */
        boolean requiresApproval = equipment.getRequiresApproval() == null
                || equipment.getRequiresApproval();

        if (requiresApproval) {

            autoBooking.setBookingStatus("Pending Approval");
            bookingRepository.save(autoBooking);
            // Equipment status is intentionally left as-is here, same
            // as createBooking()'s Pending Approval branch — it only
            // changes once a manager actually approves the booking.

        } else {

            autoBooking.setBookingStatus("Confirmed");
            bookingRepository.save(autoBooking);

            equipment.setStatus("Booked");
            equipmentRepository.save(equipment);
        }

        return true;
    }

    private User getLoggedInUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return (User) authentication.getPrincipal();
    }

    private String getRole(User user) {
        return user.getRole().getRoleName();
    }

    /*
     * Only staff belonging to the SAME institution as the equipment
     * can approve/reject/complete a booking against it. SYSTEM_ADMIN
     * is exempt (platform-wide). This is what stops a Manager at
     * College C from acting on a booking for College A's equipment.
     *
     * Beyond institution, LAB_MANAGER/LAB_TECHNICIAN/DEPARTMENT_HEAD
     * are further scoped to their OWN department — a manager in the
     * Physics department should not be able to approve/reject/
     * complete bookings for Chemistry's equipment just because it's
     * the same college. INSTITUTION_ADMIN is exempt from the
     * department check (they have no single department — their role
     * IS institution-wide review, handled separately via the
     * "Pending Institution Approval" branch in approveBooking/
     * rejectBooking).
     */
    private void assertSameInstitutionAsEquipment(User loggedInUser, String role, Equipment equipment) {
        if ("SYSTEM_ADMIN".equalsIgnoreCase(role)) {
            return;
        }

        if (loggedInUser.getInstitution() == null
                || equipment.getInstitution() == null
                || !loggedInUser.getInstitution().getInstitutionId()
                        .equals(equipment.getInstitution().getInstitutionId())) {

            throw new RuntimeException(
                    "You can only manage bookings for your own institution's equipment"
            );
        }

        if (!"INSTITUTION_ADMIN".equalsIgnoreCase(role)) {

            if (loggedInUser.getDepartment() == null
                    || equipment.getDepartment() == null
                    || !loggedInUser.getDepartment().getDepartmentId()
                            .equals(equipment.getDepartment().getDepartmentId())) {

                throw new RuntimeException(
                        "You can only manage bookings for your own department's equipment"
                );
            }
        }
    }

    private void notifyInstitutionAdmins(Equipment equipment, Booking booking) {
        if (equipment.getInstitution() == null) return;

        userRepository.findByInstitution_InstitutionId(equipment.getInstitution().getInstitutionId())
                .stream()
                .filter(user -> user.getRole() != null
                        && "INSTITUTION_ADMIN".equalsIgnoreCase(user.getRole().getRoleName()))
                .forEach(admin -> notificationService.create(
                        admin,
                        "CROSS_INSTITUTION_BOOKING_REQUEST",
                        "Cross-institution booking approval required",
                        booking.getUser().getFullName() + " requested " + equipment.getEquipmentName()
                                + ". Review and approve or reject it.",
                        booking.getBookingId()));
    }

    private void notifyInstitutionManagers(Equipment equipment, Booking booking) {
        if (equipment.getInstitution() == null) return;

        userRepository.findByInstitution_InstitutionId(equipment.getInstitution().getInstitutionId())
                .stream()
                .filter(user -> user.getRole() != null
                        && "LAB_MANAGER".equalsIgnoreCase(user.getRole().getRoleName()))
                .forEach(manager -> notificationService.create(
                        manager,
                        "BOOKING_MANAGER_APPROVAL_REQUIRED",
                        "Booking approval required",
                        "A booking for " + equipment.getEquipmentName()
                                + " passed institution review and needs your approval.",
                        booking.getBookingId()));
    }

    private boolean isManagerOrAbove(String role) {

        return role.equalsIgnoreCase("LAB_MANAGER")
                || role.equalsIgnoreCase("DEPARTMENT_HEAD")
                || role.equalsIgnoreCase("INSTITUTION_ADMIN")
                || role.equalsIgnoreCase("SYSTEM_ADMIN");
    }

    private boolean canProcessBookings(String role) {

        return role.equalsIgnoreCase("LAB_TECHNICIAN")
                || isManagerOrAbove(role);
    }

    @Override
    public Booking createBooking(Booking booking) {

        User loggedInUser = getLoggedInUser();
        String role = getRole(loggedInUser);

        if (role.equalsIgnoreCase("STUDENT")) {

            booking.setUser(loggedInUser);

        } else if (isManagerOrAbove(role)) {

            if (booking.getUser() == null) {
                booking.setUser(loggedInUser);
            }

        } else {

            throw new RuntimeException(
                    "You are not allowed to create bookings"
            );
        }

        if (booking.getEquipment() == null
                || booking.getEquipment().getEquipmentId() == null) {

            throw new RuntimeException("Equipment is required");
        }

        /*
         * The equipment object coming from the request body is often
         * just a stub with the id set. Load the full record so that
         * institution, requiresApproval, etc. are all populated.
         */
        Equipment fullEquipment =
                equipmentRepository.findById(
                                booking.getEquipment().getEquipmentId())
                        .orElseThrow(() ->
                                new RuntimeException("Equipment not found"));

        booking.setEquipment(fullEquipment);

        /*
         * Hard block on equipment that is not currently bookable at
         * all, regardless of what the time-window maintenance check
         * below finds. Covers Under Maintenance / Out of Service /
         * Retired / In Calibration — independent of whether a dated
         * Maintenance record happens to overlap the requested slot.
         */
        String currentEquipmentStatus = fullEquipment.getStatus();

        if (currentEquipmentStatus != null
                && (currentEquipmentStatus.equalsIgnoreCase("Under Maintenance")
                || currentEquipmentStatus.equalsIgnoreCase("Out of Service")
                || currentEquipmentStatus.equalsIgnoreCase("Retired")
                || currentEquipmentStatus.equalsIgnoreCase("In Calibration"))) {

            throw new RuntimeException(
                    "This equipment is currently " + currentEquipmentStatus
                            + " and cannot be booked."
            );
        }

        /*
* Live check — never a cached flag on Equipment. If there's an
* unresolved URGENT feedback report against this equipment, block
* booking immediately, evaluated fresh on every attempt.
*/
boolean hasUrgentUnresolvedIssue =
        equipmentFeedbackRepository.existsByEquipment_EquipmentIdAndUrgencyAndStatusNot(
                fullEquipment.getEquipmentId(), "URGENT", "RESOLVED"
        );

if (hasUrgentUnresolvedIssue) {
    throw new RuntimeException(
            "This equipment has an unresolved urgent issue reported and cannot be booked until it is resolved."
    );
}

        /*
         * Inter-institution access control: if the equipment belongs
         * to a different institution than the booker, an APPROVED
         * resource-sharing request between the two institutions for
         * this exact equipment must exist first.
         */
        boolean crossInstitution = fullEquipment.getInstitution() != null
                && loggedInUser.getInstitution() != null
                && !fullEquipment.getInstitution().getInstitutionId()
                        .equals(loggedInUser.getInstitution().getInstitutionId());

        if (booking.getStartTime() == null || booking.getEndTime() == null) {
            throw new RuntimeException("Start time and end time are required");
        }

        if (!booking.getEndTime().isAfter(booking.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        /*
         * bookingDate is never trusted from the client — it always
         * reflects the actual system date the booking was made on.
         * startTime must fall on or after that date, and can't be
         * in the past relative to right now.
         */
        java.time.LocalDate today = java.time.LocalDate.now();
        booking.setBookingDate(today);

        if (booking.getStartTime().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Cannot book a time slot in the past.");
        }

        if (booking.getStartTime().toLocalDate().isBefore(today)) {
            throw new RuntimeException("Start time cannot be before the booking date.");
        }

        if (booking.getEquipment() != null
                && booking.getStartTime() != null
                && booking.getEndTime() != null) {

            Integer eqId =
                    booking.getEquipment().getEquipmentId();

            List<Booking> overlappingBookings =
                    bookingRepository.findOverlappingBookings(
                            eqId,
                            booking.getStartTime(),
                            booking.getEndTime()
                    );

            if (!overlappingBookings.isEmpty()) {

                throw new RuntimeException(
                        "This equipment is already booked for the selected time slot!"
                );
            }

            if (isUnderMaintenanceDuring(
                    eqId,
                    booking.getStartTime(),
                    booking.getEndTime())) {

                throw new RuntimeException(
                        "This equipment is scheduled for maintenance during the selected time!"
                );
            }
        }

        boolean requiresApproval = booking.getEquipment().getRequiresApproval() == null
        || booking.getEquipment().getRequiresApproval();

// new:
                if (crossInstitution) {
                booking.setBookingStatus("Pending Institution Approval");
        } else {
                booking.setBookingStatus(requiresApproval ? "Pending Approval" : "Confirmed");

                if (!requiresApproval) {
                        Equipment eq = booking.getEquipment();
                        eq.setStatus("Booked");
                        equipmentRepository.save(eq);
                }
        }

        Booking saved = bookingRepository.save(booking);

// EDGE CASE: notify the actual booking owner, not necessarily the
// caller — a manager can book on behalf of a student (booking.getUser()
// is set earlier in this method for both branches).
        notificationService.create(
        saved.getUser(),
        "BOOKING_CONFIRMATION",
        saved.getBookingStatus().equals("Confirmed") ? "Booking confirmed" : "Booking request submitted",
        "Your booking for " + saved.getEquipment().getEquipmentName()
                + " is " + saved.getBookingStatus().toLowerCase() + ".",
        saved.getBookingId()
        );

                if (crossInstitution) {
                        notifyInstitutionAdmins(fullEquipment, saved);
                }

        return saved;
    }
    private boolean isUnderMaintenanceDuring(
            Integer equipmentId,
            LocalDateTime start,
            LocalDateTime end) {

        List<Maintenance> maintenanceList =
                maintenanceRepository
                        .findByEquipment_EquipmentId(
                                equipmentId
                        );

        for (Maintenance maintenance :
                maintenanceList) {

            String status =
                    maintenance.getMaintenanceStatus();

            if (status == null) {
                continue;
            }

            boolean blocksBooking =
                    status.equalsIgnoreCase("Scheduled")
                            || status.equalsIgnoreCase("Active");

            if (!blocksBooking
                    || maintenance.getMaintenanceDate() == null) {

                continue;
            }

            java.time.LocalDate maintenanceDate =
                    maintenance.getMaintenanceDate();

            if (!maintenanceDate.isBefore(start.toLocalDate())
                    && !maintenanceDate.isAfter(end.toLocalDate())) {

                return true;
            }
        }

        return false;
    }
@Override
public List<Booking> getAllBookings() {
    User loggedInUser = getLoggedInUser();
    String role = getRole(loggedInUser);

    if (role.equalsIgnoreCase("STUDENT")) {
        return bookingRepository.findByUser_UserId(loggedInUser.getUserId());
    }

    if (role.equalsIgnoreCase("SYSTEM_ADMIN")) {
        return bookingRepository.findAll();
    }

    /*
     * Staff (Technician/Manager/Dept Head/Institution Admin) only
     * see bookings for equipment their OWN institution owns — not
     * every institution's bookings combined. This matches who has
     * approval authority: you manage bookings against your own
     * equipment, regardless of which institution the booking
     * student belongs to.
     */
    if (loggedInUser.getInstitution() == null) {
        return new java.util.ArrayList<>();
    }

    Integer institutionId = loggedInUser.getInstitution().getInstitutionId();

    return bookingRepository.findAll().stream()
            .filter(b -> b.getEquipment() != null
                    && b.getEquipment().getInstitution() != null
                    && institutionId.equals(b.getEquipment().getInstitution().getInstitutionId()))
            .collect(java.util.stream.Collectors.toList());
}

@Override
public Optional<Booking> getBookingById(Integer id) {
    Optional<Booking> bookingOpt = bookingRepository.findById(id);
    if (bookingOpt.isEmpty()) {
        return Optional.empty();
    }

    User loggedInUser = getLoggedInUser();
    String role = getRole(loggedInUser);

    if (role.equalsIgnoreCase("STUDENT")
            && !bookingOpt.get().getUser().getUserId().equals(loggedInUser.getUserId())) {
        throw new RuntimeException("You can view only your own booking");
    }

    return bookingOpt;
}

    @Override
public Booking updateBooking(
        Integer id,
        Booking booking) {

    Booking existingBooking =
            bookingRepository.findById(id)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Booking not found"
                            )
                    );

    User loggedInUser = getLoggedInUser();
    String role = getRole(loggedInUser);

    if (!isManagerOrAbove(role)) {

        if (!role.equalsIgnoreCase("STUDENT")) {
            throw new RuntimeException(
                    "You are not allowed to update bookings"
            );
        }

        if (!existingBooking.getUser()
                .getUserId()
                .equals(loggedInUser.getUserId())) {

            throw new RuntimeException(
                    "You can update only your own booking"
            );
        }

        if (!isPendingApproval(existingBooking.getBookingStatus())) {
    throw new RuntimeException("Only Pending Approval bookings can be updated");
}
    }

    /*
     * Validate equipment and time before updating.
     */
    if (booking.getEquipment() == null
            || booking.getEquipment().getEquipmentId() == null
            || booking.getStartTime() == null
            || booking.getEndTime() == null) {

        throw new RuntimeException(
                "Equipment, start time and end time are required"
        );
    }

    if (!booking.getEndTime()
            .isAfter(booking.getStartTime())) {

        throw new RuntimeException(
                "End time must be after start time"
        );
    }

    if (booking.getStartTime().isBefore(java.time.LocalDateTime.now())) {
        throw new RuntimeException("Cannot move a booking to a time slot in the past.");
    }

    Integer equipmentId =
            booking.getEquipment().getEquipmentId();

    /*
     * The equipment object coming from the request body is often just
     * a stub with the id set (same situation as createBooking). Load
     * the full record so (a) the hard status block below actually has
     * a real status to check, and (b) the booking we save/return has
     * a fully populated equipment object instead of a stub with every
     * other field null.
     */
    Equipment fullEquipment =
            equipmentRepository.findById(equipmentId)
                    .orElseThrow(() ->
                            new RuntimeException("Equipment not found"));

    /*
     * Same hard block as createBooking()/approveBooking(): this was
     * missing here entirely, so a student could edit a Pending
     * Approval booking onto equipment that had since been marked
     * Under Maintenance / Out of Service / Retired / In Calibration
     * and slip past the check that blocks it everywhere else.
     */
    String currentEquipmentStatus = fullEquipment.getStatus();

    if (currentEquipmentStatus != null
            && (currentEquipmentStatus.equalsIgnoreCase("Under Maintenance")
            || currentEquipmentStatus.equalsIgnoreCase("Out of Service")
            || currentEquipmentStatus.equalsIgnoreCase("Retired")
            || currentEquipmentStatus.equalsIgnoreCase("In Calibration"))) {

        throw new RuntimeException(
                "This equipment is currently " + currentEquipmentStatus
                        + " and cannot be booked."
        );
    }

    booking.setEquipment(fullEquipment);

    /*
     * Check double booking.
     */
    List<Booking> overlappingBookings =
            bookingRepository.findOverlappingBookings(
                    equipmentId,
                    booking.getStartTime(),
                    booking.getEndTime()
            );

    /*
     * Remove the booking currently being edited
     * from the overlap result.
     */
    overlappingBookings.removeIf(
            existing ->
                    existing.getBookingId()
                            .equals(existingBooking.getBookingId())
    );

    if (!overlappingBookings.isEmpty()) {

        throw new RuntimeException(
                "This equipment is already booked for the selected time slot!"
        );
    }

    /*
     * Check maintenance.
     */
    if (isUnderMaintenanceDuring(
            equipmentId,
            booking.getStartTime(),
            booking.getEndTime())) {

        throw new RuntimeException(
                "This equipment is scheduled for maintenance during the selected time!"
        );
    }

    /*
     * Update booking details. bookingDate is intentionally left
     * untouched here — it's set once at creation to the actual
     * system date and never changes on edit.
     */
    existingBooking.setEquipment(
            booking.getEquipment()
    );

    existingBooking.setStartTime(
            booking.getStartTime()
    );

    existingBooking.setEndTime(
            booking.getEndTime()
    );

    existingBooking.setPurpose(
            booking.getPurpose()
    );

    /*
     * Only managers/admins can directly change status.
     */
    if (isManagerOrAbove(role)
            && booking.getBookingStatus() != null) {

        existingBooking.setBookingStatus(
                booking.getBookingStatus()
        );
    }

    return bookingRepository.save(
            existingBooking
    );
}

public void deleteBooking(Integer id) {

    Booking existingBooking =
            bookingRepository.findById(id)
                    .orElseThrow(() ->
                            new RuntimeException("Booking not found")
                    );

    User loggedInUser = getLoggedInUser();
    String role = getRole(loggedInUser);

    boolean isOwnBooking = existingBooking.getUser()
            .getUserId()
            .equals(loggedInUser.getUserId());

    if (!isManagerOrAbove(role)) {

        if (!role.equalsIgnoreCase("STUDENT")) {
            throw new RuntimeException("You are not allowed to delete bookings");
        }

        if (!isOwnBooking) {
            throw new RuntimeException("You can delete only your own booking");
        }

        if (!isPendingApproval(existingBooking.getBookingStatus())) {
            throw new RuntimeException("Only Pending Approval bookings can be cancelled");
        }
    }

    String previousStatus = existingBooking.getBookingStatus();

    existingBooking.setBookingStatus("Cancelled");
    bookingRepository.save(existingBooking);

    boolean wasHoldingEquipment =
            "Confirmed".equalsIgnoreCase(previousStatus)
                    || "In Use".equalsIgnoreCase(previousStatus);

    if (wasHoldingEquipment && existingBooking.getEquipment() != null) {

        Equipment equipment = existingBooking.getEquipment();
        equipment.setStatus("Available");
        equipmentRepository.save(equipment);

        notifyNextWaitlistedUser(equipment);
    }
}

    @Override
    public Booking approveBooking(Integer id) {

        Booking booking =
                bookingRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Booking not found"
                                )
                        );

        User loggedInUser = getLoggedInUser();
        String role = getRole(loggedInUser);

        if (!canProcessBookings(role)) {

            throw new RuntimeException(
                    "You are not allowed to approve bookings"
            );
        }

        if (!isPendingApproval(booking.getBookingStatus())
                && !isPendingInstitutionApproval(booking.getBookingStatus())) {
    throw new RuntimeException("Only Pending Approval bookings can be approved");
}

        Equipment equipment =
                booking.getEquipment();

        if (equipment == null
                || booking.getStartTime() == null
                || booking.getEndTime() == null) {

            throw new RuntimeException(
                    "Booking equipment and time are required"
            );
        }

        /*
         * A Pending Approval / Pending Institution Approval request
         * whose slot has already ended can no longer be approved —
         * previously this fell through, got set to "Confirmed", and
         * then got silently flipped to "Completed" by the very next
         * autoCompleteOverdueBookings() sweep (within 60s), which
         * looked to staff like clicking Approve auto-completed the
         * booking. Reject it explicitly instead, with a clear reason.
         */
        if (booking.getEndTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException(
                    "This booking's requested time slot has already passed and can no longer be approved. Please reject it instead."
            );
        }

        assertSameInstitutionAsEquipment(loggedInUser, role, equipment);

                if (isPendingInstitutionApproval(booking.getBookingStatus())) {
                        if (!"INSTITUTION_ADMIN".equalsIgnoreCase(role)
                                        && !"SYSTEM_ADMIN".equalsIgnoreCase(role)) {
                                throw new RuntimeException("Only the equipment owner's institution admin can approve this request first");
                        }

                        booking.setBookingStatus("Pending Approval");
                        Booking saved = bookingRepository.save(booking);
                        notifyInstitutionManagers(equipment, saved);
                        notificationService.create(
                                        booking.getUser(),
                                        "CROSS_INSTITUTION_BOOKING_REVIEWED",
                                        "Booking passed institution review",
                                        "Your request for " + equipment.getEquipmentName()
                                                        + " is now waiting for the owning lab manager's approval.",
                                        booking.getBookingId());
                        return saved;
                }

                if ("INSTITUTION_ADMIN".equalsIgnoreCase(role)) {
                        throw new RuntimeException("Institution admins only approve the initial cross-institution review");
                }

        Integer equipmentId =
                equipment.getEquipmentId();

        /*
         * Same hard block as createBooking(): equipment status may
         * have changed to Under Maintenance / Out of Service /
         * Retired / In Calibration between when the student submitted
         * this request and now, so re-check it at approval time too.
         */
        String currentEquipmentStatus = equipment.getStatus();

        if (currentEquipmentStatus != null
                && (currentEquipmentStatus.equalsIgnoreCase("Under Maintenance")
                || currentEquipmentStatus.equalsIgnoreCase("Out of Service")
                || currentEquipmentStatus.equalsIgnoreCase("Retired")
                || currentEquipmentStatus.equalsIgnoreCase("In Calibration"))) {

            throw new RuntimeException(
                    "This equipment is currently " + currentEquipmentStatus
                            + " and cannot be approved for booking."
            );
        }

        /*
         * Same live urgent-feedback check as createBooking(): a
         * booking can be submitted before an urgent report comes in
         * and still be sitting Pending Approval, so this must be
         * re-checked here too, not just at submission time.
         */
        boolean hasUrgentUnresolvedIssueAtApproval =
                equipmentFeedbackRepository.existsByEquipment_EquipmentIdAndUrgencyAndStatusNot(
                        equipmentId, "URGENT", "RESOLVED"
                );

        if (hasUrgentUnresolvedIssueAtApproval) {
            throw new RuntimeException(
                    "This equipment has an unresolved urgent issue reported and cannot be approved for booking."
            );
        }

        LocalDateTime start =
                booking.getStartTime();

        LocalDateTime end =
                booking.getEndTime();

        /*
         * Re-check double booking during approval.
         */
        List<Booking> overlappingBookings =
                bookingRepository.findOverlappingBookings(
                        equipmentId,
                        start,
                        end
                );

        overlappingBookings.removeIf(
                existing ->
                        existing.getBookingId()
                                .equals(booking.getBookingId())
        );

        if (!overlappingBookings.isEmpty()) {

            throw new RuntimeException(
                    "This equipment is already booked for the selected time slot!"
            );
        }

        /*
         * Re-check maintenance during approval.
         */
        if (isUnderMaintenanceDuring(
                equipmentId,
                start,
                end)) {

            throw new RuntimeException(
                    "This equipment is scheduled for maintenance during the selected time!"
            );
        }

        booking.setBookingStatus("Confirmed");

        /*
         * If the approved booking is already in progress,
         * the equipment should immediately be In Use — and so
         * should the booking's own status (previously only the
         * equipment flipped here; the booking sat at "Confirmed"
         * until the next 60s sweep caught it via
         * EquipmentStatusScheduler.activateInUseBookings(), which
         * still exists as a safety net for slots that start after
         * approval rather than during it).
         * Otherwise it is Booked for a future reservation.
         */
        LocalDateTime now =
                LocalDateTime.now();

        if (!now.isBefore(start)
                && now.isBefore(end)) {

            equipment.setStatus("In Use");
            booking.setBookingStatus("In Use");

        } else if (now.isBefore(start)) {

            equipment.setStatus("Booked");

        } else {

            equipment.setStatus("Available");
        }

        // NOTE: lastUsedDate is intentionally NOT set here anymore.
        // Approval means the slot is reserved, not that the equipment
        // has actually been used yet. lastUsedDate now only updates
        // when usage is actually completed — see completeBooking()
        // and autoCompleteOverdueBookings() below.

        equipmentRepository.save(equipment);

        realtimeUpdateService.pingEquipmentUpdated();

        Booking savedApproval = bookingRepository.save(booking);

        // Previously nothing notified the requester when their booking
        // was actually approved — only booking creation and the two
        // cross-institution intermediate hops fired a notification.
        notificationService.create(
                savedApproval.getUser(),
                "BOOKING_APPROVED",
                "Booking approved",
                "Your booking for " + equipment.getEquipmentName()
                        + " has been approved and is now " + savedApproval.getBookingStatus() + ".",
                savedApproval.getBookingId()
        );

        return savedApproval;
    }

    @Override
    public Booking rejectBooking(Integer id) {

        Booking booking =
                bookingRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Booking not found"
                                )
                        );

        User loggedInUser = getLoggedInUser();
        String role = getRole(loggedInUser);

        if (!canProcessBookings(role)) {

            throw new RuntimeException(
                    "You are not allowed to reject bookings"
            );
        }

        if (!isPendingApproval(booking.getBookingStatus())
                && !isPendingInstitutionApproval(booking.getBookingStatus())) {
    throw new RuntimeException("Only Pending Approval bookings can be rejected");
}

        if (booking.getEquipment() != null) {
            assertSameInstitutionAsEquipment(loggedInUser, role, booking.getEquipment());
        }

                if (isPendingInstitutionApproval(booking.getBookingStatus())
                                && !"INSTITUTION_ADMIN".equalsIgnoreCase(role)
                                && !"SYSTEM_ADMIN".equalsIgnoreCase(role)) {
                        throw new RuntimeException("Only the equipment owner's institution admin can reject this request first");
                }

        booking.setBookingStatus("Rejected");

        Booking savedBooking =
                bookingRepository.save(booking);

        notificationService.create(
                savedBooking.getUser(),
                "BOOKING_REJECTED",
                "Booking rejected",
                "Your booking for " + (booking.getEquipment() != null
                        ? booking.getEquipment().getEquipmentName() : "the requested equipment")
                        + " was rejected.",
                savedBooking.getBookingId()
        );

        if (booking.getEquipment() != null) {

            notifyNextWaitlistedUser(
                    booking.getEquipment()
            );
        }

        return savedBooking;
    }

    @Override
    public Booking completeBooking(Integer id) {

        Booking booking =
                bookingRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Booking not found"
                                )
                        );

        User loggedInUser = getLoggedInUser();
        String role = getRole(loggedInUser);

        if (!canProcessBookings(role)) {

            throw new RuntimeException(
                    "You are not allowed to mark bookings as completed"
            );
        }

        if (booking.getEquipment() != null) {
            assertSameInstitutionAsEquipment(loggedInUser, role, booking.getEquipment());
        }

        booking.setBookingStatus("Completed");

        Equipment equipment =
                booking.getEquipment();

        if (equipment != null) {

            equipment.setStatus("Available");

            // lastUsedDate now updates here, at actual usage
            // completion, instead of at approval time.
            equipment.setLastUsedDate(java.time.LocalDate.now());

            equipmentRepository.save(equipment);

            notifyNextWaitlistedUser(
                    equipment
            );
        }

        Booking savedCompletion = bookingRepository.save(booking);

        notificationService.create(
                savedCompletion.getUser(),
                "BOOKING_COMPLETED",
                "Booking completed",
                "Your booking for " + (equipment != null ? equipment.getEquipmentName() : "the equipment")
                        + " has been marked complete.",
                savedCompletion.getBookingId()
        );

        return savedCompletion;
    }

    /*
     * Called by EquipmentStatusScheduler every 60s. Any booking
     * still sitting at "Confirmed" after its endTime has passed
     * gets auto-completed — this is the piece that was missing
     * entirely: nothing previously called completeBooking() unless
     * a staff member manually clicked something, and no such button
     * even existed in the frontend, so Confirmed bookings sat there
     * forever with no path to Completed.
     */
    @Override
    public void autoCompleteOverdueBookings() {

        LocalDateTime now = LocalDateTime.now();

        // Now catches both statuses — a booking whose end time has
        // passed could be sitting at either "Confirmed" (never entered
        // its window, e.g. a very short slot the sweep didn't catch
        // in between) or "In Use" (the normal case, now that
        // EquipmentStatusScheduler.activateInUseBookings() actually
        // flips Confirmed → In Use once the window opens).
        List<Booking> candidates =
                bookingRepository.findByBookingStatusIn(List.of("Confirmed", "In Use"));

        for (Booking booking : candidates) {

            if (booking.getEndTime() == null
                    || booking.getEndTime().isAfter(now)) {
                continue;
            }

            booking.setBookingStatus("Completed");

            Equipment equipment = booking.getEquipment();

            if (equipment != null) {
                equipment.setStatus("Available");

                // Same lastUsedDate update as the manual
                // completeBooking() path above, for bookings that
                // get auto-completed by the scheduler instead.
                equipment.setLastUsedDate(java.time.LocalDate.now());

                equipmentRepository.save(equipment);
                notifyNextWaitlistedUser(equipment);
            }

            Booking savedAutoCompletion = bookingRepository.save(booking);

            notificationService.create(
                    savedAutoCompletion.getUser(),
                    "BOOKING_COMPLETED",
                    "Booking completed",
                    "Your booking for " + (equipment != null ? equipment.getEquipmentName() : "the equipment")
                            + " has ended and was automatically marked complete.",
                    savedAutoCompletion.getBookingId()
            );
        }

        expireStalePendingBookings(now);
    }

    /*
     * A Pending Approval / Pending Institution Approval request whose
     * slot has already fully passed will now be blocked from manual
     * approval (see the guard added in approveBooking()), but nothing
     * was closing it out automatically — it would just sit there
     * forever, still shown to staff as something to act on. This
     * closes it the same way a staff rejection would, and tells the
     * requester why.
     */
    private void expireStalePendingBookings(LocalDateTime now) {

        List<Booking> stalePending = bookingRepository.findByBookingStatusIn(
                List.of("Pending Approval", "Pending Institution Approval"));

        for (Booking booking : stalePending) {

            if (booking.getEndTime() == null || booking.getEndTime().isAfter(now)) {
                continue;
            }

            booking.setBookingStatus("Rejected");
            Booking savedExpiry = bookingRepository.save(booking);

            notificationService.create(
                    savedExpiry.getUser(),
                    "BOOKING_REJECTED",
                    "Booking request expired",
                    "Your booking request for " + (booking.getEquipment() != null
                            ? booking.getEquipment().getEquipmentName() : "the requested equipment")
                            + " expired before it was approved, because the requested time slot passed.",
                    savedExpiry.getBookingId()
            );

            if (booking.getEquipment() != null) {
                notifyNextWaitlistedUser(booking.getEquipment());
            }
        }
    }

    private String normalizeBookingStatus(String status) {
    if (status == null) return "";
    String s = status.trim().toLowerCase();
    if (s.equals("pending") || s.equals("pending approval") || s.equals("pending_approval")) {
        return "pending approval";
    }
        if (s.equals("pending institution approval") || s.equals("pending_institution_approval")) {
                return "pending institution approval";
        }
    if (s.equals("confirmed")) return "confirmed";
    if (s.equals("in use") || s.equals("in_use")) return "in use";
    if (s.equals("rejected")) return "rejected";
    if (s.equals("completed")) return "completed";
    if (s.equals("cancelled") || s.equals("canceled")) return "cancelled";
    if (s.equals("no show") || s.equals("no_show")) return "no show";
    return s;
}

private boolean isPendingApproval(String status) {
        return "pending approval".equals(normalizeBookingStatus(status))
                        || isPendingInstitutionApproval(status);
}

private boolean isPendingInstitutionApproval(String status) {
        return "pending institution approval".equals(normalizeBookingStatus(status));
}

}