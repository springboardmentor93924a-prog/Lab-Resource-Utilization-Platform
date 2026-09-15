package com.labresource.backend.maintenance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ManagerFinalizeRequestDto {

    @NotNull(message = "Final start datetime is required.")
    private LocalDateTime finalStartDateTime;

    @NotNull(message = "Final end datetime is required.")
    private LocalDateTime finalEndDateTime;

    private String managerNotes;
}
