package com.labplatform.booking.service;

import com.labplatform.auth.model.User;
import com.labplatform.auth.repository.UserRepository;
import com.labplatform.booking.dto.WaitlistJoinRequest;
import com.labplatform.booking.dto.WaitlistResponse;
import com.labplatform.booking.model.WaitlistEntry;
import com.labplatform.booking.model.WaitlistStatus;
import com.labplatform.booking.repository.WaitlistEntryRepository;
import com.labplatform.equipment.model.Equipment;
import com.labplatform.equipment.repository.EquipmentRepository;
import com.labplatform.notification.service.NotificationService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WaitlistService {

    private final WaitlistEntryRepository waitlistRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public WaitlistService(
            WaitlistEntryRepository waitlistRepository,
            EquipmentRepository equipmentRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.waitlistRepository = waitlistRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    private User resolveCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"));
    }

    public WaitlistResponse joinWaitlist(
            WaitlistJoinRequest request,
            String requesterEmail) {

        User currentUser = resolveCurrentUser(requesterEmail);

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Equipment not found with id: "
                                + request.getEquipmentId()));

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "End time must be after start time");
        }

        WaitlistEntry entry = new WaitlistEntry();

        entry.setUser(currentUser);
        entry.setEquipment(equipment);
        entry.setRequestedDate(request.getRequestedDate());
        entry.setStartTime(request.getStartTime());
        entry.setEndTime(request.getEndTime());
        entry.setStatus(WaitlistStatus.WAITING);

        WaitlistEntry saved = waitlistRepository.save(entry);

        /*
         * Immediately notify the user that they have been
         * successfully added to the waitlist.
         */
        notificationService.create(
                currentUser,
                "WAITLIST_JOINED",
                "You have been added to the waitlist for "
                        + equipment.getEquipmentName()
                        + " on "
                        + request.getRequestedDate()
                        + " from "
                        + request.getStartTime()
                        + " to "
                        + request.getEndTime()
                        + "."
        );

        return new WaitlistResponse(saved);
    }

    public List<WaitlistResponse> getMyWaitlistEntries(
            String requesterEmail) {

        User currentUser = resolveCurrentUser(requesterEmail);

        return waitlistRepository.findByUserId(currentUser.getId())
                .stream()
                .map(WaitlistResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Called when a booking slot becomes available.
     *
     * Finds the earliest WAITING user whose requested time overlaps
     * with the newly available booking time.
     */
    public void notifyNextInLineIfAny(
            Long equipmentId,
            LocalDate bookingDate,
            LocalTime availableStartTime,
            LocalTime availableEndTime) {

        List<WaitlistEntry> waitingEntries =
                waitlistRepository
                        .findByEquipmentIdAndRequestedDateAndStatusOrderByCreatedAtAsc(
                                equipmentId,
                                bookingDate,
                                WaitlistStatus.WAITING);

        /*
         * Find the first waiting user whose requested time overlaps
         * with the available slot.
         *
         * Overlap condition:
         *
         * requestedStart < availableEnd
         * AND
         * availableStart < requestedEnd
         */
        WaitlistEntry next = waitingEntries.stream()
                .filter(entry ->
                        entry.getStartTime().isBefore(availableEndTime)
                                && availableStartTime.isBefore(entry.getEndTime())
                )
                .findFirst()
                .orElse(null);

        if (next == null) {
            return;
        }

        /*
         * Mark this waitlist entry as NOTIFIED.
         */
        next.setStatus(WaitlistStatus.NOTIFIED);

        waitlistRepository.save(next);

        /*
         * Notify the user.
         */
        notificationService.create(
                next.getUser(),
                "WAITLIST_SLOT_OPEN",
                "The equipment "
                        + next.getEquipment().getEquipmentName()
                        + " is now available on "
                        + next.getRequestedDate()
                        + " from "
                        + availableStartTime
                        + " to "
                        + availableEndTime
                        + ". You are next in the waitlist. Try booking it now."
        );
    }
}