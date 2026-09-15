package com.labresource.backend.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BookingRejectRequestDto {

    @NotBlank(message = "Rejection reason is required.")
    @Size(max = 1000, message = "Rejection reason cannot exceed 1000 characters.")
    private String reason;

    public BookingRejectRequestDto(String reason) {
        this.reason = reason;
    }
}
