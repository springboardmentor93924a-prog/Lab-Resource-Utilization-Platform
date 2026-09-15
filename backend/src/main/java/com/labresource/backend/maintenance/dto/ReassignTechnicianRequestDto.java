package com.labresource.backend.maintenance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReassignTechnicianRequestDto {

    @NotNull(message = "New technician ID is required.")
    private Long newTechnicianId;

    private LocalDateTime targetStartDateTime;

    private LocalDateTime targetEndDateTime;

    private String managerInstructions;

    private String reason;
}
