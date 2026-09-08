package com.example.demo.controller;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Booking;
import com.example.demo.entity.Equipment;
import com.example.demo.entity.Utilization;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.EquipmentRepository;
import com.example.demo.repository.UtilizationRepository;
import com.example.demo.entity.Notification;
import com.example.demo.repository.NotificationRepository;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private EquipmentRepository equipmentRepository;
    @Autowired private UtilizationRepository utilizationRepository;
    @Autowired private com.example.demo.repository.UserRepository userRepository;
    @Autowired private NotificationRepository notificationRepository;

    private void notify(com.example.demo.entity.User user, String message) {
        Notification n = new Notification();
        n.setUser(user);
        n.setMessage(message);
        n.setIsRead(false);
        n.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(n);
    }

   @GetMapping
    public List<Map<String, Object>> getAll() {
        return bookingRepository.findAll().stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/user/{userId}")
    public List<Map<String, Object>> getByUser(@PathVariable Integer userId) {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getUser() != null && userId.equals(b.getUser().getUserId()))
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Integer id) {
        if (!bookingRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
        }
        Booking b = bookingRepository.findById(id).get();
        b.setStatus("Cancelled");
        b.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(b);
        return ResponseEntity.ok(toResponse(b));
    }

    private Map<String, Object> toResponse(Booking b) {
        Map<String, Object> m = new java.util.HashMap<>();
        m.put("id", b.getBookingId());
        m.put("equipmentName", b.getEquipment() != null ? b.getEquipment().getName() : null);
        m.put("userFullName", b.getUser() != null ? (b.getUser().getFirstName() + " " + b.getUser().getLastName()) : null);
        m.put("bookingDate", b.getBookingStart() != null ? b.getBookingStart().toLocalDate().toString() : null);
        m.put("startTime", b.getBookingStart() != null ? b.getBookingStart().toLocalTime().toString() : null);
        m.put("endTime", b.getBookingEnd() != null ? b.getBookingEnd().toLocalTime().toString() : null);
        m.put("purpose", b.getPurpose());
        m.put("bookingStatus", b.getStatus() != null ? b.getStatus().toUpperCase().replace(" ", "_") : null);
        m.put("priorityBooking", false);
        return m;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Booking booking, java.security.Principal principal) {
        if (booking.getBookingStart() == null || booking.getBookingEnd() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "bookingStart and bookingEnd are required"));
        }
        if (!booking.getBookingEnd().isAfter(booking.getBookingStart())) {
            return ResponseEntity.badRequest().body(Map.of("error", "bookingEnd must be after bookingStart"));
        }
        if (booking.getEquipment() == null || booking.getEquipment().getEquipmentId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "equipment.equipmentId is required"));
        }
        com.example.demo.entity.User requestingUser = userRepository.findByEmail(principal.getName()).orElse(null);
        if (requestingUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Could not identify logged-in user"));
        }
        booking.setUser(requestingUser);

        Equipment targetEq = equipmentRepository.findById(booking.getEquipment().getEquipmentId()).orElse(null);
        if (targetEq == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Equipment not found"));
        }
        if (requestingUser.getDepartment() != null) {
            Integer userInstitutionId = requestingUser.getDepartment().getInstitution().getInstitutionId();
            Integer eqInstitutionId = targetEq.getInstitution().getInstitutionId();
            if (!userInstitutionId.equals(eqInstitutionId) && !Boolean.TRUE.equals(targetEq.getSharedAvailable())) {
                return ResponseEntity.status(403).body(Map.of("error", "This equipment is not shared for external institution booking"));
            }
        }
        if ("Booked".equals(targetEq.getStatus())) {
            booking.setStatus("Waitlisted");
        } else {
            booking.setStatus("Pending Approval");
        }
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMINISTRATOR') or hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<?> approve(@PathVariable Integer id) {
        if (!bookingRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
        }
        Booking b = bookingRepository.findById(id).get();
        b.setStatus("Confirmed");
        notify(b.getUser(), "Your booking for " + b.getEquipment().getName() + " has been approved.");
        b.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(b);

        Equipment eq = b.getEquipment();
        eq.setStatus("Booked");
        eq.setUpdatedAt(LocalDateTime.now());
        equipmentRepository.save(eq);

        Utilization usage = new Utilization();
        usage.setEquipment(eq);
        usage.setBooking(b);
        usage.setDepartment(eq.getDepartment());
        usage.setUsageDate(LocalDate.now());
        long hours = Duration.between(b.getBookingStart(), b.getBookingEnd()).toMinutes() / 60;
        usage.setHoursUsed(BigDecimal.valueOf(Math.max(hours, 1)));
        usage.setCreatedAt(LocalDateTime.now());
        utilizationRepository.save(usage);

        return ResponseEntity.ok(b);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMINISTRATOR') or hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<?> reject(@PathVariable Integer id) {
        if (!bookingRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
        }
        Booking b = bookingRepository.findById(id).get();
        b.setStatus("Cancelled");
        notify(b.getUser(), "Your booking for " + b.getEquipment().getName() + " has been rejected.");
        b.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(bookingRepository.save(b));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('LAB_MANAGER') or hasRole('DEPARTMENT_HEAD') or hasRole('INSTITUTION_ADMINISTRATOR') or hasRole('SYSTEM_ADMINISTRATOR')")
    public ResponseEntity<?> complete(@PathVariable Integer id) {
        if (!bookingRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
        }
        Booking b = bookingRepository.findById(id).get();
        b.setStatus("Completed");
        b.setUpdatedAt(LocalDateTime.now());
        long completedHours = Duration.between(b.getBookingStart(), b.getBookingEnd()).toMinutes() / 60;
        java.math.BigDecimal rate = b.getEquipment().getHourlyRate() != null ? b.getEquipment().getHourlyRate() : java.math.BigDecimal.ZERO;
        b.setCost(rate.multiply(java.math.BigDecimal.valueOf(Math.max(completedHours, 1))));
        bookingRepository.save(b);

        Equipment eq = b.getEquipment();
        eq.setStatus("Available");
        eq.setUpdatedAt(LocalDateTime.now());
        equipmentRepository.save(eq);

        return ResponseEntity.ok(b);
    }
}
