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
import com.example.lab_platform.entity.WorkOrder;
import com.example.lab_platform.repository.WorkOrderRepository;
import com.example.lab_platform.repository.ResourceSharingRepository;
import com.example.lab_platform.service.NotificationService;

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
    private final WorkOrderRepository workOrderRepository;
    private final ResourceSharingRepository resourceSharingRepository;
    private final EquipmentFeedbackRepository equipmentFeedbackRepository;
    private final NotificationService notificationService;

public BookingServiceImpl(
        BookingRepository bookingRepository,
        EquipmentRepository equipmentRepository,
        WaitlistRepository waitlistRepository,
        WorkOrderRepository workOrderRepository,
        ResourceSharingRepository resourceSharingRepository,
        EquipmentFeedbackRepository equipmentFeedbackRepository,
        NotificationService notificationService) {

    this.bookingRepository = bookingRepository;
    this.equipmentRepository = equipmentRepository;
    this.waitlistRepository = waitlistRepository;
    this.workOrderRepository = workOrderRepository;
    this.resourceSharingRepository = resourceSharingRepository;
    this.equipmentFeedbackRepository = equipmentFeedbackRepository;
    this.notificationService = notificationService;
}
    
    /*
     * Thin wrapper kept so the existing call sites (rejectBooking,
     * completeBooking, autoCompleteOverdueBookings) don't need to
     * change — delegates to the full cascade below instead of only
     * ever looking at a single entry.
     */
    private void notifyNextWaitlistedUser(Equipment equipment) {
        if (equipment == null) {
            return;
        }
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

            boolean allocated = tryAutoAllocate(entry, equipment);

            if (allocated) {

                entry.setWaitlistStatus("FULFILLED");
                waitlistRepository.save(entry);

                notificationService.create(
                        entry.getUser(),
                        "WAITLIST_FULFILLED",
                        "Your waitlisted slot is booked",
                        "Your requested slot for " + equipment.getEquipmentName()
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
        autoBooking.setBookingStatus("Confirmed");

        bookingRepository.save(autoBooking);

        equipment.setStatus("Booked");
        equipmentRepository.save(equipment);

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
        if (fullEquipment.getInstitution() != null
                && loggedInUser.getInstitution() != null
                && !fullEquipment.getInstitution().getInstitutionId()
                        .equals(loggedInUser.getInstitution().getInstitutionId())) {

            boolean shared =
                    resourceSharingRepository
                            .existsBySenderInstitution_InstitutionIdAndReceiverInstitution_InstitutionIdAndEquipment_EquipmentIdAndStatus(
                                    fullEquipment.getInstitution().getInstitutionId(),
                                    loggedInUser.getInstitution().getInstitutionId(),
                                    fullEquipment.getEquipmentId(),
                                    "APPROVED"
                            );

            if (!shared) {
                throw new RuntimeException(
                        "This equipment belongs to another institution and is not shared with yours. "
                                + "Request access via Resource Sharing first."
                );
            }
        }

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

if (requiresApproval) {
    booking.setBookingStatus("Pending Approval");
} else {
    booking.setBookingStatus("Confirmed");

    Equipment eq = booking.getEquipment();
    eq.setStatus("Booked");
    equipmentRepository.save(eq);
}

        return bookingRepository.save(booking);
    }

    private static final List<String> CLOSED_WORK_ORDER_STATUSES = List.of("completed", "cancelled");

    private boolean isUnderMaintenanceDuring(
            Integer equipmentId,
            LocalDateTime start,
            LocalDateTime end) {

        List<WorkOrder> workOrders =
                workOrderRepository
                        .findByEquipment_EquipmentId(
                                equipmentId
                        );

        for (WorkOrder workOrder : workOrders) {

            String status = workOrder.getWorkOrderStatus();

            boolean blocksBooking =
                    status == null
                            || !CLOSED_WORK_ORDER_STATUSES.contains(status.toLowerCase());

            java.time.LocalDate workOrderDate = workOrder.getStartDate();

            if (!blocksBooking || workOrderDate == null) {
                continue;
            }

            if (!workOrderDate.isBefore(start.toLocalDate())
                    && !workOrderDate.isAfter(end.toLocalDate())) {

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

        if (!isPendingApproval(booking.getBookingStatus())) {
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

        assertSameInstitutionAsEquipment(loggedInUser, role, equipment);

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
         * the equipment should immediately be In Use.
         * Otherwise it is Booked for a future reservation.
         */
        LocalDateTime now =
                LocalDateTime.now();

        if (!now.isBefore(start)
                && now.isBefore(end)) {

            equipment.setStatus("In Use");

        } else if (now.isBefore(start)) {

            equipment.setStatus("Booked");

        } else {

            equipment.setStatus("Available");
        }

        if (booking.getEndTime() != null) {

            equipment.setLastUsedDate(
                    booking.getEndTime().toLocalDate()
            );
        }

        equipmentRepository.save(equipment);

        return bookingRepository.save(booking);
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

        if (!isPendingApproval(booking.getBookingStatus())) {
    throw new RuntimeException("Only Pending Approval bookings can be rejected");
}

        if (booking.getEquipment() != null) {
            assertSameInstitutionAsEquipment(loggedInUser, role, booking.getEquipment());
        }

        booking.setBookingStatus("Rejected");

        Booking savedBooking =
                bookingRepository.save(booking);

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

            equipmentRepository.save(equipment);

            notifyNextWaitlistedUser(
                    equipment
            );
        }

        return bookingRepository.save(booking);
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

        List<Booking> confirmed =
                bookingRepository.findByBookingStatus("Confirmed");

        for (Booking booking : confirmed) {

            if (booking.getEndTime() == null
                    || booking.getEndTime().isAfter(now)) {
                continue;
            }

            booking.setBookingStatus("Completed");

            Equipment equipment = booking.getEquipment();

            if (equipment != null) {
                equipment.setStatus("Available");
                equipmentRepository.save(equipment);
                notifyNextWaitlistedUser(equipment);
            }

            bookingRepository.save(booking);
        }
    }

    private String normalizeBookingStatus(String status) {
    if (status == null) return "";
    String s = status.trim().toLowerCase();
    if (s.equals("pending") || s.equals("pending approval") || s.equals("pending_approval")) {
        return "pending approval";
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
    return "pending approval".equals(normalizeBookingStatus(status));
}

}