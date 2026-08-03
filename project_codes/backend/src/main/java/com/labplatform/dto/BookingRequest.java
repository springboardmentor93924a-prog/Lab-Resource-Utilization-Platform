package com.labplatform.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingRequest {
    private Long equipmentId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private boolean recurring;
    private String recurrenceRule;
}
