package com.labresource.service;

import com.labresource.dto.WaitlistRequestDto;
import com.labresource.dto.WaitlistResponseDto;

import java.util.List;

public interface WaitlistService {

    WaitlistResponseDto addToWaitlist(
            WaitlistRequestDto request
    );

    WaitlistResponseDto getWaitlistById(
            String waitlistId
    );

    List<WaitlistResponseDto> getAllWaitlists();

    List<WaitlistResponseDto> getWaitlistsByEquipment(
            String equipmentId
    );

    List<WaitlistResponseDto> getWaitlistsByUser(
            String userId
    );

    WaitlistResponseDto allocateNextUser(
            String equipmentId
    );

    WaitlistResponseDto markAsBooked(
            String waitlistId,
            String bookingId
    );

    WaitlistResponseDto markAsNotified(
            String waitlistId
    );

    WaitlistResponseDto markAsExpired(
            String waitlistId
    );

    void cancelWaitlist(
            String waitlistId
    );

    void updateQueuePositions(
            String equipmentId
    );

}