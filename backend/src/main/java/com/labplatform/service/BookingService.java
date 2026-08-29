package com.labplatform.service;

import com.labplatform.dto.Dtos;
import com.labplatform.entity.*;
import com.labplatform.exception.BookingConflictException;
import com.labplatform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    @Transactional
    public Booking createBooking(String userEmail, Dtos.BookingRequest req) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Equipment equipment = equipmentRepository.findById(req.equipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                equipment.getId(), req.startTime(), req.endTime());
        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Slot is already booked for this resource.");
        }

        long hours = Math.max(1, Duration.between(req.startTime(), req.endTime()).toHours());
        double totalCost = hours * equipment.getHourlyRate();

        boolean isInter = user.getInstitution() != null && equipment.getInstitution() != null
                && !user.getInstitution().getId().equals(equipment.getInstitution().getId());

        Booking booking = Booking.builder()
                .equipment(equipment)
                .user(user)
                .startTime(req.startTime())
                .endTime(req.endTime())
                .purpose(req.purpose())
                .totalCost(totalCost)
                .status(BookingStatus.CONFIRMED)
                .isInterInstitution(isInter)
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() { 
        return bookingRepository.findAll(); 
    }

    public List<Booking> getPendingBookings() {
        return bookingRepository.findByStatus(BookingStatus.PENDING_APPROVAL);
    }

    @Transactional
    public Booking updateStatus(Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
}