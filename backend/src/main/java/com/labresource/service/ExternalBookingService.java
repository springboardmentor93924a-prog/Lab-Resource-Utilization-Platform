package com.labresource.service;

import com.labresource.dto.ExternalBookingRequestDto;
import com.labresource.dto.ExternalBookingResponseDto;
import com.labresource.dto.ExternalBookingReviewDto;

import java.time.LocalDateTime;
import java.util.List;

public interface ExternalBookingService {

    ExternalBookingResponseDto createExternalBooking(
            ExternalBookingRequestDto requestDto
    );

    List<ExternalBookingResponseDto> getAllExternalBookings();

    ExternalBookingResponseDto getExternalBookingById(
            String externalBookingId
    );

    List<ExternalBookingResponseDto> getBookingsByEquipment(
            String equipmentId
    );

    List<ExternalBookingResponseDto> getBookingsByUser(
            String userId
    );

    List<ExternalBookingResponseDto> getBookingsByRequestingInstitution(
            String institutionId
    );

    List<ExternalBookingResponseDto> getBookingsByProviderInstitution(
            String institutionId
    );

    List<ExternalBookingResponseDto> getBookingsByStatus(
            String status
    );

    List<ExternalBookingResponseDto> getProviderBookingsByStatus(
            String providerInstitutionId,
            String status
    );

    List<ExternalBookingResponseDto> getBookingsByDateRange(
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    ExternalBookingResponseDto reviewExternalBooking(
            String externalBookingId,
            ExternalBookingReviewDto reviewDto
    );

    ExternalBookingResponseDto cancelExternalBooking(
            String externalBookingId,
            String userId
    );

    ExternalBookingResponseDto completeExternalBooking(
            String externalBookingId
    );

    void deleteExternalBooking(
            String externalBookingId
    );
}