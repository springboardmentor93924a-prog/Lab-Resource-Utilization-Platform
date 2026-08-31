package com.labresource.service;

import com.labresource.dto.WaitlistRequest;
import com.labresource.dto.WaitlistResponse;
import com.labresource.entity.Equipment;
import com.labresource.entity.User;
import com.labresource.entity.Waitlist;
import com.labresource.entity.WaitlistStatus;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.UserRepository;
import com.labresource.repository.WaitlistRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WaitlistService {

    private final WaitlistRepository waitlistRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    public WaitlistService(
            WaitlistRepository waitlistRepository,
            EquipmentRepository equipmentRepository,
            UserRepository userRepository
    ) {
        this.waitlistRepository = waitlistRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE WAITLIST
    // =========================================================

    public WaitlistResponse createWaitlist(
            WaitlistRequest request
    ) {

        if (request.getEquipmentId() == null) {
            throw new RuntimeException("Equipment is required");
        }

        if (request.getUserId() == null) {
            throw new RuntimeException("User is required");
        }

        if (request.getBookingDate() == null) {
            throw new RuntimeException("Booking date is required");
        }

        if (request.getStartTime() == null ||
                request.getEndTime() == null) {

            throw new RuntimeException(
                    "Start time and end time are required"
            );
        }

        if (!request.getEndTime().isAfter(
                request.getStartTime()
        )) {

            throw new RuntimeException(
                    "End time must be after start time"
            );
        }

        Equipment equipment =
                equipmentRepository.findById(
                        request.getEquipmentId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Equipment not found"
                        )
                );

        User user =
                userRepository.findById(
                        request.getUserId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        // =====================================================
        // CHECK DUPLICATE ACTIVE WAITLIST
        // =====================================================

        boolean alreadyWaiting =
                waitlistRepository
                        .existsByEquipmentIdAndUserIdAndBookingDateAndStartTimeAndEndTimeAndStatus(
                                request.getEquipmentId(),
                                request.getUserId(),
                                request.getBookingDate(),
                                request.getStartTime(),
                                request.getEndTime(),
                                WaitlistStatus.WAITING
                        );

        if (alreadyWaiting) {
            throw new RuntimeException(
                    "You are already on the waitlist for this time"
            );
        }

        // =====================================================
        // CREATE WAITLIST
        // =====================================================

        Waitlist waitlist = new Waitlist();

        waitlist.setEquipment(equipment);
        waitlist.setUser(user);

        waitlist.setBookingDate(
                request.getBookingDate()
        );

        waitlist.setStartTime(
                request.getStartTime()
        );

        waitlist.setEndTime(
                request.getEndTime()
        );

        waitlist.setPurpose(
                request.getPurpose()
        );

        waitlist.setStatus(
                WaitlistStatus.WAITING
        );

        Waitlist saved =
                waitlistRepository.save(waitlist);

        return convertToResponse(saved);
    }

    // =========================================================
    // OVERLAP CHECK
    // =========================================================

    private boolean isOverlapping(
            LocalTime newStart,
            LocalTime newEnd,
            LocalTime existingStart,
            LocalTime existingEnd
    ) {

        return newStart.isBefore(existingEnd)
                && newEnd.isAfter(existingStart);
    }

    // =========================================================
    // GET USER WAITLISTS
    // =========================================================

    public List<WaitlistResponse> getUserWaitlists(
            Long userId
    ) {

        return waitlistRepository
                .findByUserId(userId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET EQUIPMENT WAITLISTS
    // =========================================================

    public List<WaitlistResponse> getEquipmentWaitlists(
            Long equipmentId
    ) {

        return waitlistRepository
                .findByEquipmentId(equipmentId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET ALL WAITLISTS - ADMIN
    // =========================================================

    public List<WaitlistResponse> getAllWaitlists() {

        return waitlistRepository
                .findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET WAITING WAITLISTS - ADMIN
    // =========================================================

    public List<WaitlistResponse> getWaitingWaitlists() {

        return waitlistRepository
                .findByStatus(
                        WaitlistStatus.WAITING
                )
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET SINGLE WAITLIST
    // =========================================================

    public WaitlistResponse getWaitlist(Long id) {

        Waitlist waitlist =
                waitlistRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Waitlist entry not found"
                                )
                        );

        return convertToResponse(waitlist);
    }

    // =========================================================
    // GET WAITLIST POSITION
    // =========================================================

    public int getWaitlistPosition(Long id) {

        Waitlist waitlist =
                waitlistRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Waitlist entry not found"
                                )
                        );

        if (waitlist.getStatus()
                != WaitlistStatus.WAITING) {

            return 0;
        }

        List<Waitlist> queue =
                waitlistRepository
                        .findByEquipmentIdAndBookingDateAndStartTimeAndEndTimeAndStatusOrderByCreatedAtAsc(
                                waitlist.getEquipment().getId(),
                                waitlist.getBookingDate(),
                                waitlist.getStartTime(),
                                waitlist.getEndTime(),
                                WaitlistStatus.WAITING
                        );

        for (int i = 0; i < queue.size(); i++) {

            if (queue.get(i)
                    .getId()
                    .equals(waitlist.getId())) {

                return i + 1;
            }
        }

        return 0;
    }

    // =========================================================
    // GET WAITLIST QUEUE
    // =========================================================

    public List<WaitlistResponse> getWaitlistQueue(
            Long equipmentId,
            LocalDate bookingDate,
            LocalTime startTime,
            LocalTime endTime
    ) {

        List<Waitlist> queue =
                waitlistRepository
                        .findByEquipmentIdAndBookingDateAndStartTimeAndEndTimeAndStatusOrderByCreatedAtAsc(
                                equipmentId,
                                bookingDate,
                                startTime,
                                endTime,
                                WaitlistStatus.WAITING
                        );

        return queue
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // CHECK DUPLICATE WAITLIST
    // =========================================================

    public boolean isAlreadyOnWaitlist(
            Long equipmentId,
            Long userId,
            LocalDate bookingDate,
            LocalTime startTime,
            LocalTime endTime
    ) {

        return waitlistRepository
                .existsByEquipmentIdAndUserIdAndBookingDateAndStartTimeAndEndTimeAndStatus(
                        equipmentId,
                        userId,
                        bookingDate,
                        startTime,
                        endTime,
                        WaitlistStatus.WAITING
                );
    }

    // =========================================================
    // NOTIFY WAITLIST USER - ADMIN
    // =========================================================

    public WaitlistResponse notifyWaitlist(Long id) {

        Waitlist waitlist =
                waitlistRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Waitlist entry not found"
                                )
                        );

        if (waitlist.getStatus()
                != WaitlistStatus.WAITING) {

            throw new RuntimeException(
                    "Only waiting requests can be notified"
            );
        }

        waitlist.setStatus(
                WaitlistStatus.NOTIFIED
        );

        Waitlist saved =
                waitlistRepository.save(waitlist);

        return convertToResponse(saved);
    }

    // =========================================================
    // MARK AS BOOKED - ADMIN
    // =========================================================

    public WaitlistResponse markAsBooked(Long id) {

        Waitlist waitlist =
                waitlistRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Waitlist entry not found"
                                )
                        );

        if (waitlist.getStatus()
                != WaitlistStatus.NOTIFIED) {

            throw new RuntimeException(
                    "Only notified requests can be marked as booked"
            );
        }

        waitlist.setStatus(
                WaitlistStatus.BOOKED
        );

        Waitlist saved =
                waitlistRepository.save(waitlist);

        return convertToResponse(saved);
    }

    // =========================================================
    // CANCEL WAITLIST
    // =========================================================

    public WaitlistResponse cancelWaitlist(Long id) {

        Waitlist waitlist =
                waitlistRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Waitlist entry not found"
                                )
                        );

        if (waitlist.getStatus()
                == WaitlistStatus.CANCELLED) {

            throw new RuntimeException(
                    "Waitlist is already cancelled"
            );
        }

        waitlist.setStatus(
                WaitlistStatus.CANCELLED
        );

        Waitlist saved =
                waitlistRepository.save(waitlist);

        return convertToResponse(saved);
    }

    // =========================================================
    // ENTITY -> RESPONSE
    // =========================================================

    private WaitlistResponse convertToResponse(
            Waitlist waitlist
    ) {

        return new WaitlistResponse(

                waitlist.getId(),

                waitlist.getEquipment().getId(),

                waitlist.getEquipment().getName(),

                waitlist.getEquipment().getAssetTag(),

                waitlist.getUser().getId(),

                waitlist.getUser().getFullName(),

                waitlist.getUser().getEmail(),

                waitlist.getBookingDate(),

                waitlist.getStartTime(),

                waitlist.getEndTime(),

                waitlist.getPurpose(),

                waitlist.getStatus().name(),

                waitlist.getCreatedAt()
        );
    }
}
