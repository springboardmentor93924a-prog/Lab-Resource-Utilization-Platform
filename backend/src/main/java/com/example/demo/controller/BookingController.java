package com.example.demo.controller;

import com.example.demo.entity.Booking;
import com.example.demo.entity.Equipment;
import com.example.demo.entity.Utilization;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.EquipmentRepository;
import com.example.demo.repository.UtilizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private EquipmentRepository equipmentRepository;
    @Autowired private UtilizationRepository utilizationRepository;
    @Autowired private com.example.demo.repository.UserRepository userRepository;

    @GetMapping
    public List<Booking> getAll() {
        return bookingRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Booking booking) {
        if (booking.getBookingStart() == null || booking.getBookingEnd() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "bookingStart and bookingEnd are required"));
        }
        if (!booking.getBookingEnd().isAfter(booking.getBookingStart())) {
            return ResponseEntity.badRequest().body(Map.of("error", "bookingEnd must be after bookingStart"));
        }
        Equipment targetEq = equipmentRepository.findById(booking.getEquipment().getEquipmentId()).orElse(null);
        if (targetEq != null && booking.getUser() != null && booking.getUser().getUserId() != null) {
            com.example.demo.entity.User requestingUser = userRepository.findById(booking.getUser().getUserId()).orElse(null);
            if (requestingUser != null && requestingUser.getDepartment() != null) {
                Integer userInstitutionId = requestingUser.getDepartment().getInstitution().getInstitutionId();
                Integer eqInstitutionId = targetEq.getInstitution().getInstitutionId();
                if (!userInstitutionId.equals(eqInstitutionId) && !Boolean.TRUE.equals(targetEq.getSharedAvailable())) {
                    return ResponseEntity.status(403).body(Map.of("error", "This equipment is not shared for external institution booking"));
                }
            }
        }
        if (targetEq != null && "Booked".equals(targetEq.getStatus())) {
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
        bookingRepository.save(b);

        Equipment eq = b.getEquipment();
        eq.setStatus("Available");
        eq.setUpdatedAt(LocalDateTime.now());
        equipmentRepository.save(eq);

        return ResponseEntity.ok(b);
    }
}



