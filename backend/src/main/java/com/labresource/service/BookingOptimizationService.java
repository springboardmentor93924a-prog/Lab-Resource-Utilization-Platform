package com.labresource.service;

import com.labresource.dto.BookingOptimizationResponseDto;

import java.time.LocalDateTime;

public interface BookingOptimizationService {

    BookingOptimizationResponseDto getOptimizedBookingSuggestions(
            String equipmentId,
            LocalDateTime requestedStartTime,
            LocalDateTime requestedEndTime
    );

    boolean isEquipmentAvailableForSlot(
            String equipmentId,
            LocalDateTime requestedStartTime,
            LocalDateTime requestedEndTime
    );
}