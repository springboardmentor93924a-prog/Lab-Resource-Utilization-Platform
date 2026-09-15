package com.labresource.backend.maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TechnicianPlanRequestDto {

    @NotBlank(message = "Delay reason is required.")
    private String delayReason;

    @NotNull(message = "Proposed start datetime is required.")
    private LocalDateTime proposedStartDateTime;

    @NotNull(message = "Proposed end datetime is required.")
    private LocalDateTime proposedEndDateTime;

    private Boolean requiresParts = false;

    private String partsDetails;
}
