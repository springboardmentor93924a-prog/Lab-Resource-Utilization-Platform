package com.labresource.backend.maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RemoveAssignmentRequestDto {

    @NotBlank(message = "Removal reason is required.")
    private String reason;
}
