package com.infosys.labresource.EquipmentUtilization.DTOs;

import com.infosys.labresource.EquipmentUtilization.Entity.UtilizationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UtilizationResponseDTO {
    private Long utilizationId;

    private Long bookingId;

    private Long equipId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Double usageHours;

    private UtilizationStatus status;

    private LocalDateTime lastUpdated;
}
