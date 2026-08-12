package com.infosys.labresource.booking.dtos;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class WaitlistResponseDTO {
    private Long waitlistId;

    private Long bookingId;

    private Long equipId;

    private Long requestedById;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime addedAt;

    private Integer position;

    private Boolean active;
}
