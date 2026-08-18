package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.service.BookingService;
import com.example.lab_platform.entity.Waitlist;
import com.example.lab_platform.repository.WaitlistRepository;
import com.example.lab_platform.entity.Maintenance;
import com.example.lab_platform.repository.MaintenanceRepository;
import com.example.lab_platform.repository.ResourceSharingRepository;

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

    public BookingServiceImpl(
            BookingRepository bookingRepository,
            EquipmentRepository equipmentRepository,
            WaitlistRepository waitlistRepository,
            MaintenanceRepository maintenanceRepository,
            ResourceSharingRepository resourceSharingRepository) {

        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.waitlistRepository = waitlistRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.resourceSharingRepository = resourceSharingRepository;
    }

    private void notifyNextWaitlistedUser(Equipment equipment) {

        if (equipment == null) {
            return;
        }

        List<Waitlist> waitingEntries =
                waitlistRepository
                        .findByEquipment_EquipmentIdAndWaitlistStatusOrderByCreatedAtAsc(
                                equipment.getEquipmentId(),
                                "WAITING"
                        );

        if (waitingEntries.isEmpty()) {
            return;
        }

        Waitlist nextInLine = waitingEntries.get(0);

        boolean allocated =
                tryAutoAllocate(nextInLine, equipment);

        if (allocated) {
            nextInLine.setWaitlistStatus("FULFILLED");
        } else {
            nextInLine.setWaitlistStatus("NOTIFIED");
        }

        waitlistRepository.save(nextInLine);
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

        Booking autoBooking = new Booking();

        autoBooking.setUser(entry.getUser());
        autoBooking.setEquipment(equipment);
        autoBooking.setBookingDate(start.toLocalDate());
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

        booking.setBookingStatus("Pending Approval");

        return bookingRepository.save(booking);
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

    return bookingRepository.findAll();
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

    Integer equipmentId =
            booking.getEquipment().getEquipmentId();

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
     * Update booking details.
     */
    existingBooking.setEquipment(
            booking.getEquipment()
    );

    existingBooking.setBookingDate(
            booking.getBookingDate()
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
    @Override
    public void deleteBooking(Integer id) {

        Booking existingBooking =
                bookingRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Booking not found"
                                )
                        );

        User loggedInUser = getLoggedInUser();
        String role = getRole(loggedInUser);

        if (isManagerOrAbove(role)) {

            bookingRepository.delete(existingBooking);
            return;
        }

        if (!role.equalsIgnoreCase("STUDENT")) {

            throw new RuntimeException(
                    "You are not allowed to delete bookings"
            );
        }

        if (!existingBooking.getUser()
                .getUserId()
                .equals(loggedInUser.getUserId())) {

            throw new RuntimeException(
                    "You can delete only your own booking"
            );
        }

        if (!isPendingApproval(existingBooking.getBookingStatus())) {
    throw new RuntimeException("Only Pending Approval bookings can be deleted");
}

        bookingRepository.delete(existingBooking);
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

        Integer equipmentId =
                equipment.getEquipmentId();

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