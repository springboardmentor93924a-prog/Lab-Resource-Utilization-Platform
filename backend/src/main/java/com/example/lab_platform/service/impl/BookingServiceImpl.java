package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.service.BookingService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;

    public BookingServiceImpl(BookingRepository bookingRepository,
                              EquipmentRepository equipmentRepository) {
        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
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
        return bookingRepository.save(booking);
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
        }

        return bookingRepository.save(booking);
    }
}