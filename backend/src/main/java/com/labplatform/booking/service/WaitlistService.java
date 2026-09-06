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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WaitlistService {

    private final WaitlistEntryRepository waitlistRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    public WaitlistService(WaitlistEntryRepository waitlistRepository,
                           EquipmentRepository equipmentRepository,
                           UserRepository userRepository) {
        this.waitlistRepository = waitlistRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
    }

    private User resolveCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }

    public WaitlistResponse joinWaitlist(WaitlistJoinRequest request, String requesterEmail) {
        User currentUser = resolveCurrentUser(requesterEmail);

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Equipment not found with id: " + request.getEquipmentId()));

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        WaitlistEntry entry = new WaitlistEntry();
        entry.setUser(currentUser);
        entry.setEquipment(equipment);
        entry.setRequestedDate(request.getRequestedDate());
        entry.setStartTime(request.getStartTime());
        entry.setEndTime(request.getEndTime());
        entry.setStatus(WaitlistStatus.WAITING);

        WaitlistEntry saved = waitlistRepository.save(entry);
        return new WaitlistResponse(saved);
    }

    public List<WaitlistResponse> getMyWaitlistEntries(String requesterEmail) {
        User currentUser = resolveCurrentUser(requesterEmail);
        return waitlistRepository.findByUserId(currentUser.getId())
                .stream()
                .map(WaitlistResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Called when a booking is cancelled. Finds the earliest WAITING entry for the
     * same equipment/date whose requested time overlaps the freed slot, and marks
     * it NOTIFIED so the user sees "a slot opened up" on their dashboard.
     */
    public void notifyNextInLineIfAny(Long equipmentId, LocalDate bookingDate) {
        List<WaitlistEntry> waitingEntries = waitlistRepository
                .findByEquipmentIdAndRequestedDateAndStatusOrderByCreatedAtAsc(
                        equipmentId, bookingDate, WaitlistStatus.WAITING);

        if (!waitingEntries.isEmpty()) {
            WaitlistEntry next = waitingEntries.get(0);
            next.setStatus(WaitlistStatus.NOTIFIED);
            waitlistRepository.save(next);
        }
    }
}