package com.labresource.backend.sharing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SharingMoUProposalDto {

    @NotNull(message = "Proposed hourly rate is required")
    @DecimalMin(value = "0.0", message = "Hourly rate must be non-negative")
    private BigDecimal proposedHourlyRate;

    @NotBlank(message = "MoU terms and conditions are required")
    private String mouTerms;

    private LocalDate availableStartDate;
    private LocalDate availableEndDate;
    private LocalTime availableStartTime;
    private LocalTime availableEndTime;
}
