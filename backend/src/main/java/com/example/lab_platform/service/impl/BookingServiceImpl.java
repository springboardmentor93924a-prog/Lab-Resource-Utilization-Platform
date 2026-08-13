package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.service.BookingService;
import com.example.lab_platform.entity.Waitlist;
import com.example.lab_platform.repository.WaitlistRepository;

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

    public BookingServiceImpl(BookingRepository bookingRepository,
                              EquipmentRepository equipmentRepository,
                              WaitlistRepository waitlistRepository) {
        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.waitlistRepository = waitlistRepository;
    }

    /*
     * When equipment becomes available, try to allocate it
     * to the next person in line on the waitlist.
     *
     * - If their requested time window is still valid (in the future,
     *   end after start) and doesn't overlap anything else, we
     *   auto-create a Confirmed booking for them and mark the
     *   waitlist entry FULFILLED.
     * - Otherwise, we just mark them NOTIFIED so they can book manually.
     */
    private void notifyNextWaitlistedUser(Equipment equipment) {
        if (equipment == null) {
            return;
        }

        List<Waitlist> waitingEntries =
                waitlistRepository.findByEquipment_EquipmentIdAndWaitlistStatusOrderByCreatedAtAsc(
                        equipment.getEquipmentId(),
                        "WAITING"
                );

        if (waitingEntries.isEmpty()) {
            return;
        }

        Waitlist nextInLine = waitingEntries.get(0);

        boolean allocated = tryAutoAllocate(nextInLine, equipment);

        if (allocated) {
            nextInLine.setWaitlistStatus("FULFILLED");
        } else {
            nextInLine.setWaitlistStatus("NOTIFIED");
        }

        waitlistRepository.save(nextInLine);
    }

    /*
     * Attempts to create a Confirmed booking for the waitlisted user
     * using their originally requested time window. Returns true if
     * the booking was created, false if the window is no longer valid.
     */
    private boolean tryAutoAllocate(Waitlist entry, Equipment equipment) {
        LocalDateTime start = entry.getRequestedStartTime();
        LocalDateTime end = entry.getRequestedEndTime();

        if (start == null || end == null) {
            return false;
        }

        // Window must still be in the future and well-formed
        if (!end.isAfter(start) || start.isBefore(LocalDateTime.now())) {
            return false;
        }

        // Make sure nothing else booked that slot in the meantime
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                equipment.getEquipmentId(), start, end
        );

        if (!overlapping.isEmpty()) {
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
                SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    private String getRole(User user) {
        return user.getRole().getRoleName();
    }

    /*
     * Roles that act as managers/admins for booking purposes:
     * can update, delete, or act on ANY booking, not just their own.
     */
    private boolean isManagerOrAbove(String role) {
        return role.equalsIgnoreCase("LAB_MANAGER")
                || role.equalsIgnoreCase("DEPARTMENT_HEAD")
                || role.equalsIgnoreCase("INSTITUTION_ADMIN")
                || role.equalsIgnoreCase("SYSTEM_ADMIN");
    }

    /*
     * Roles allowed to approve / reject / complete bookings.
     * Matches BookingController's @PreAuthorize on those endpoints.
     */
    private boolean canProcessBookings(String role) {
        return role.equalsIgnoreCase("LAB_TECHNICIAN")
                || isManagerOrAbove(role);
    }

    @Override
    public Booking createBooking(Booking booking) {
        User loggedInUser = getLoggedInUser();
        String role = getRole(loggedInUser);

        if (role.equalsIgnoreCase("STUDENT")) {
            // Students always book for themselves.
            booking.setUser(loggedInUser);
        } else if (isManagerOrAbove(role)) {
            // Managers/Admins may book on behalf of a user if provided,
            // otherwise the booking is attributed to themselves.
            if (booking.getUser() == null) {
                booking.setUser(loggedInUser);
            }
        } else {
            throw new RuntimeException("You are not allowed to create bookings");
        }

        // --- DOUBLE BOOKING PREVENTION CHECK ---
        if (booking.getEquipment() != null && booking.getStartTime() != null && booking.getEndTime() != null) {
            Integer eqId = booking.getEquipment().getEquipmentId();
            List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                eqId, booking.getStartTime(), booking.getEndTime()
            );

            if (!overlappingBookings.isEmpty()) {
                throw new RuntimeException("This equipment is already booked for the selected time slot!");
            }
        }
        // ----------------------------------------

        booking.setBookingStatus("Pending");
        return bookingRepository.save(booking);
    }

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public Optional<Booking> getBookingById(Integer id) {
        return bookingRepository.findById(id);
    }

    @Override
    public Booking updateBooking(Integer id, Booking booking) {
        Booking existingBooking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User loggedInUser = getLoggedInUser();
        String role = getRole(loggedInUser);

        // Managers/Admins can update any booking
        if (!isManagerOrAbove(role)) {

            if (!role.equalsIgnoreCase("STUDENT")) {
                throw new RuntimeException("You are not allowed to update bookings");
            }

            if (!existingBooking.getUser().getUserId().equals(loggedInUser.getUserId())) {
                throw new RuntimeException("You can update only your own booking");
            }

            if (!"Pending".equalsIgnoreCase(existingBooking.getBookingStatus())) {
                throw new RuntimeException("Only Pending bookings can be updated");
            }
        }

        existingBooking.setEquipment(booking.getEquipment());
        existingBooking.setBookingDate(booking.getBookingDate());
        existingBooking.setStartTime(booking.getStartTime());
        existingBooking.setEndTime(booking.getEndTime());
        existingBooking.setPurpose(booking.getPurpose());

        // Only Managers/Admins can directly change status via update
        if (isManagerOrAbove(role) && booking.getBookingStatus() != null) {
            existingBooking.setBookingStatus(booking.getBookingStatus());
        }

        return bookingRepository.save(existingBooking);
    }

    @Override
    public void deleteBooking(Integer id) {
        Booking existingBooking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User loggedInUser = getLoggedInUser();
        String role = getRole(loggedInUser);

        // Managers/Admins can delete any booking
        if (isManagerOrAbove(role)) {
            bookingRepository.delete(existingBooking);
            return;
        }

        // Students can only cancel (delete) their own Pending booking
        if (!role.equalsIgnoreCase("STUDENT")) {
            throw new RuntimeException("You are not allowed to delete bookings");
        }

        if (!existingBooking.getUser().getUserId().equals(loggedInUser.getUserId())) {
            throw new RuntimeException("You can delete only your own booking");
        }

        if (!"Pending".equalsIgnoreCase(existingBooking.getBookingStatus())) {
            throw new RuntimeException("Only Pending bookings can be deleted");
        }

        bookingRepository.delete(existingBooking);
    }

    @Override
    public Booking approveBooking(Integer id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User loggedInUser = getLoggedInUser();
        String role = getRole(loggedInUser);

        if (!canProcessBookings(role)) {
            throw new RuntimeException("You are not allowed to approve bookings");
        }

        if (!"Pending".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new RuntimeException("Only Pending bookings can be approved");
        }

        booking.setBookingStatus("Confirmed");

        Equipment equipment = booking.getEquipment();

        if (equipment != null) {

            equipment.setStatus("Booked");

            if (booking.getEndTime() != null) {
                equipment.setLastUsedDate(
                        booking.getEndTime().toLocalDate()
                );
            }

            equipmentRepository.save(equipment);
        }

        return bookingRepository.save(booking);
    }

    @Override
    public Booking rejectBooking(Integer id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User loggedInUser = getLoggedInUser();
        String role = getRole(loggedInUser);

        if (!canProcessBookings(role)) {
            throw new RuntimeException("You are not allowed to reject bookings");
        }

        if (!"Pending".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new RuntimeException("Only Pending bookings can be rejected");
        }

        booking.setBookingStatus("Rejected");

        Booking savedBooking = bookingRepository.save(booking);

        if (booking.getEquipment() != null) {
            notifyNextWaitlistedUser(booking.getEquipment());
        }

        return savedBooking;
    }

    @Override
    public Booking completeBooking(Integer id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User loggedInUser = getLoggedInUser();
        String role = getRole(loggedInUser);

        if (!canProcessBookings(role)) {
            throw new RuntimeException("You are not allowed to mark bookings as completed");
        }

        booking.setBookingStatus("Completed");

        Equipment equipment = booking.getEquipment();
        if (equipment != null) {
            equipment.setStatus("Available");
            equipmentRepository.save(equipment);

            notifyNextWaitlistedUser(equipment);
        }

        return bookingRepository.save(booking);
    }
}