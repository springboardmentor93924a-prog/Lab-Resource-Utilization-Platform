package com.labresource.backend.maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ManagerAssignRequestDto {
    @NotNull(message = "Technician ID is required.")
    private Long technicianId;

    @NotNull(message = "Target start datetime is required.")
    private LocalDateTime targetStartDateTime;

    @NotNull(message = "Target end datetime is required.")
    private LocalDateTime targetEndDateTime;

    @NotBlank(message = "Problem / repair description is required.")
    private String problemDescription;

    private String managerInstructions;
}

