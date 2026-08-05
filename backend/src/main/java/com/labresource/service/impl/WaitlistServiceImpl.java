package com.labresource.service.impl;

import com.labresource.dto.WaitlistRequestDto;
import com.labresource.dto.WaitlistResponseDto;
import com.labresource.entity.Booking;
import com.labresource.entity.Equipment;
import com.labresource.entity.User;
import com.labresource.entity.WaitlistEntry;
import com.labresource.enums.WaitlistStatus;
import com.labresource.repository.BookingRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.UserRepository;
import com.labresource.repository.WaitlistRepository;
import com.labresource.service.WaitlistService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class WaitlistServiceImpl implements WaitlistService {

    private final WaitlistRepository waitlistRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public WaitlistServiceImpl(
            WaitlistRepository waitlistRepository,
            EquipmentRepository equipmentRepository,
            UserRepository userRepository,
            BookingRepository bookingRepository
    ) {
        this.waitlistRepository = waitlistRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public WaitlistResponseDto addToWaitlist(WaitlistRequestDto request) {

        validateRequestedTime(
                request.getRequestedStartTime(),
                request.getRequestedEndTime()
        );

        Equipment equipment = equipmentRepository
                .findById(request.getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        User user = userRepository
                .findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean duplicateEntry =
                waitlistRepository
                        .existsByEquipmentAndUserAndRequestedStartTimeAndRequestedEndTimeAndStatus(
                                equipment,
                                user,
                                request.getRequestedStartTime(),
                                request.getRequestedEndTime(),
                                WaitlistStatus.WAITING
                        );

        if (duplicateEntry) {
            throw new RuntimeException(
                    "User is already in the waitlist for this equipment and time slot"
            );
        }

        WaitlistEntry waitlistEntry = new WaitlistEntry();

        waitlistEntry.setEquipment(equipment);
        waitlistEntry.setUser(user);
        waitlistEntry.setRequestedStartTime(request.getRequestedStartTime());
        waitlistEntry.setRequestedEndTime(request.getRequestedEndTime());
        waitlistEntry.setPriority(
                request.getPriority() == null ? 1 : request.getPriority()
        );
        waitlistEntry.setPurpose(request.getPurpose());
        waitlistEntry.setRemarks(request.getRemarks());
        waitlistEntry.setStatus(WaitlistStatus.WAITING);

        WaitlistEntry savedEntry =
                waitlistRepository.save(waitlistEntry);

        updateQueuePositions(equipment.getId());

        WaitlistEntry refreshedEntry =
                waitlistRepository.findById(savedEntry.getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Waitlist entry not found after save"
                                ));

        return mapToResponse(refreshedEntry);
    }

    @Override
    public WaitlistResponseDto getWaitlistById(String waitlistId) {
        return mapToResponse(getWaitlistEntry(waitlistId));
    }

    @Override
    public List<WaitlistResponseDto> getAllWaitlists() {
        return waitlistRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<WaitlistResponseDto> getWaitlistsByEquipment(
            String equipmentId
    ) {

        Equipment equipment = equipmentRepository
                .findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        return waitlistRepository
                .findByEquipmentOrderByPriorityDescCreatedAtAsc(equipment)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<WaitlistResponseDto> getWaitlistsByUser(String userId) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return waitlistRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public WaitlistResponseDto allocateNextUser(String equipmentId) {

        Equipment equipment = equipmentRepository
                .findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        WaitlistEntry nextEntry = waitlistRepository
                .findFirstByEquipmentAndStatusOrderByPriorityDescCreatedAtAsc(
                        equipment,
                        WaitlistStatus.WAITING
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "No waiting user found for this equipment"
                        ));

        LocalDateTime now = LocalDateTime.now();

        nextEntry.setStatus(WaitlistStatus.ALLOCATED);
        nextEntry.setAllocatedAt(now);
        nextEntry.setNotifiedAt(now);
        nextEntry.setAllocationExpiresAt(now.plusMinutes(30));
        nextEntry.setQueuePosition(null);

        WaitlistEntry savedEntry =
                waitlistRepository.save(nextEntry);

        updateQueuePositions(equipmentId);

        return mapToResponse(savedEntry);
    }

    @Override
    public WaitlistResponseDto markAsBooked(
            String waitlistId,
            String bookingId
    ) {

        WaitlistEntry waitlistEntry =
                getWaitlistEntry(waitlistId);

        if (waitlistEntry.getStatus() != WaitlistStatus.ALLOCATED
                && waitlistEntry.getStatus() != WaitlistStatus.NOTIFIED) {

            throw new RuntimeException(
                    "Only an allocated or notified waitlist entry can be booked"
            );
        }

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getEquipment() == null
                || !booking.getEquipment().getId()
                .equals(waitlistEntry.getEquipment().getId())) {

            throw new RuntimeException(
                    "Booking equipment does not match waitlist equipment"
            );
        }

        if (booking.getUser() == null
                || !booking.getUser().getId()
                .equals(waitlistEntry.getUser().getId())) {

            throw new RuntimeException(
                    "Booking user does not match waitlist user"
            );
        }

        waitlistEntry.setBooking(booking);
        waitlistEntry.setStatus(WaitlistStatus.BOOKED);
        waitlistEntry.setBookedAt(LocalDateTime.now());
        waitlistEntry.setQueuePosition(null);
        waitlistEntry.setAllocationExpiresAt(null);

        WaitlistEntry savedEntry =
                waitlistRepository.save(waitlistEntry);

        updateQueuePositions(
                waitlistEntry.getEquipment().getId()
        );

        return mapToResponse(savedEntry);
    }

    @Override
    public WaitlistResponseDto markAsNotified(String waitlistId) {

        WaitlistEntry waitlistEntry =
                getWaitlistEntry(waitlistId);

        if (waitlistEntry.getStatus() != WaitlistStatus.WAITING) {
            throw new RuntimeException(
                    "Only a waiting entry can be marked as notified"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        waitlistEntry.setStatus(WaitlistStatus.NOTIFIED);
        waitlistEntry.setNotifiedAt(now);
        waitlistEntry.setAllocationExpiresAt(now.plusMinutes(30));
        waitlistEntry.setQueuePosition(null);

        WaitlistEntry savedEntry =
                waitlistRepository.save(waitlistEntry);

        updateQueuePositions(
                waitlistEntry.getEquipment().getId()
        );

        return mapToResponse(savedEntry);
    }

    @Override
    public WaitlistResponseDto markAsExpired(String waitlistId) {

        WaitlistEntry waitlistEntry =
                getWaitlistEntry(waitlistId);

        if (waitlistEntry.getStatus() != WaitlistStatus.ALLOCATED
                && waitlistEntry.getStatus() != WaitlistStatus.NOTIFIED) {

            throw new RuntimeException(
                    "Only an allocated or notified entry can expire"
            );
        }

        waitlistEntry.setStatus(WaitlistStatus.EXPIRED);
        waitlistEntry.setExpiredAt(LocalDateTime.now());
        waitlistEntry.setQueuePosition(null);
        waitlistEntry.setAllocationExpiresAt(null);

        WaitlistEntry savedEntry =
                waitlistRepository.save(waitlistEntry);

        updateQueuePositions(
                waitlistEntry.getEquipment().getId()
        );

        return mapToResponse(savedEntry);
    }

    @Override
    public void cancelWaitlist(String waitlistId) {

        WaitlistEntry waitlistEntry =
                getWaitlistEntry(waitlistId);

        if (waitlistEntry.getStatus() == WaitlistStatus.BOOKED) {
            throw new RuntimeException(
                    "Booked waitlist entry cannot be cancelled"
            );
        }

        if (waitlistEntry.getStatus() == WaitlistStatus.CANCELLED) {
            throw new RuntimeException(
                    "Waitlist entry is already cancelled"
            );
        }

        waitlistEntry.setStatus(WaitlistStatus.CANCELLED);
        waitlistEntry.setCancelledAt(LocalDateTime.now());
        waitlistEntry.setQueuePosition(null);
        waitlistEntry.setAllocationExpiresAt(null);

        waitlistRepository.save(waitlistEntry);

        updateQueuePositions(
                waitlistEntry.getEquipment().getId()
        );
    }

    @Override
    public void updateQueuePositions(String equipmentId) {

        Equipment equipment = equipmentRepository
                .findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        List<WaitlistEntry> waitingEntries =
                waitlistRepository
                        .findByEquipmentAndStatusOrderByPriorityDescCreatedAtAsc(
                                equipment,
                                WaitlistStatus.WAITING
                        );

        int position = 1;

        for (WaitlistEntry entry : waitingEntries) {
            entry.setQueuePosition(position);
            position++;
        }

        waitlistRepository.saveAll(waitingEntries);
    }

    private void validateRequestedTime(
            LocalDateTime requestedStartTime,
            LocalDateTime requestedEndTime
    ) {

        if (requestedStartTime == null || requestedEndTime == null) {
            throw new RuntimeException(
                    "Requested start time and end time are required"
            );
        }

        if (!requestedStartTime.isAfter(LocalDateTime.now())) {
            throw new RuntimeException(
                    "Requested start time must be in the future"
            );
        }

        if (!requestedEndTime.isAfter(requestedStartTime)) {
            throw new RuntimeException(
                    "Requested end time must be after requested start time"
            );
        }
    }

    private WaitlistEntry getWaitlistEntry(String waitlistId) {
        return waitlistRepository
                .findById(waitlistId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Waitlist entry not found"
                        ));
    }

    private WaitlistResponseDto mapToResponse(
            WaitlistEntry waitlistEntry
    ) {

        WaitlistResponseDto response =
                new WaitlistResponseDto();

        response.setId(waitlistEntry.getId());

        if (waitlistEntry.getEquipment() != null) {
            response.setEquipmentId(
                    waitlistEntry.getEquipment().getId()
            );
            response.setEquipmentName(
                    waitlistEntry.getEquipment().getName()
            );
        }

        if (waitlistEntry.getUser() != null) {
            response.setUserId(
                    waitlistEntry.getUser().getId()
            );

            String firstName =
                    waitlistEntry.getUser().getFirstName();

            String lastName =
                    waitlistEntry.getUser().getLastName();

            String fullName =
                    (firstName == null ? "" : firstName)
                            + " "
                            + (lastName == null ? "" : lastName);

            response.setUserName(fullName.trim());
        }

        if (waitlistEntry.getBooking() != null) {
            response.setBookingId(
                    waitlistEntry.getBooking().getId()
            );
        }

        response.setQueuePosition(
                waitlistEntry.getQueuePosition()
        );
        response.setPriority(
                waitlistEntry.getPriority()
        );
        response.setStatus(
                waitlistEntry.getStatus()
        );
        response.setRequestedStartTime(
                waitlistEntry.getRequestedStartTime()
        );
        response.setRequestedEndTime(
                waitlistEntry.getRequestedEndTime()
        );
        response.setNotifiedAt(
                waitlistEntry.getNotifiedAt()
        );
        response.setAllocationExpiresAt(
                waitlistEntry.getAllocationExpiresAt()
        );
        response.setAllocatedAt(
                waitlistEntry.getAllocatedAt()
        );
        response.setBookedAt(
                waitlistEntry.getBookedAt()
        );
        response.setPurpose(
                waitlistEntry.getPurpose()
        );
        response.setRemarks(
                waitlistEntry.getRemarks()
        );
        response.setCreatedAt(
                waitlistEntry.getCreatedAt()
        );
        response.setUpdatedAt(
                waitlistEntry.getUpdatedAt()
        );

        return response;
    }
}
