package com.labresource.service;

import com.labresource.dto.UtilizationLogRequestDto;
import com.labresource.dto.UtilizationLogResponseDto;

import java.time.LocalDateTime;
import java.util.List;

public interface UtilizationLogService {

    UtilizationLogResponseDto createUtilizationLog(
            UtilizationLogRequestDto requestDto
    );

    List<UtilizationLogResponseDto> getAllUtilizationLogs();

    UtilizationLogResponseDto getUtilizationLogById(
            String id
    );

    List<UtilizationLogResponseDto> getLogsByEquipment(
            String equipmentId
    );

    List<UtilizationLogResponseDto> getLogsByUser(
            String userId
    );

    List<UtilizationLogResponseDto> getLogsByBooking(
            String bookingId
    );

    List<UtilizationLogResponseDto> getLogsByStatus(
            String status
    );

    List<UtilizationLogResponseDto> getLogsByDateRange(
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    List<UtilizationLogResponseDto> getEquipmentLogsByDateRange(
            String equipmentId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    UtilizationLogResponseDto getCurrentUtilization(
            String equipmentId
    );

    UtilizationLogResponseDto stopUtilization(
            String utilizationLogId,
            String remarks
    );

    UtilizationLogResponseDto updateUtilizationLog(
            String id,
            UtilizationLogRequestDto requestDto
    );

    void deleteUtilizationLog(
            String id
    );
}