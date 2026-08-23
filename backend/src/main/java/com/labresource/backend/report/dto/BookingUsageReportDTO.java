package com.labresource.backend.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingUsageReportDTO {
    private String equipmentName;
    private Long equipmentId;
    private String userName;
    private Long userId;
    private String userEmail;
    private LocalDateTime bookingDate; // createdAt
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private Integer actualUsageDurationMinutes;
    private String bookingStatus;
    private Boolean completed;
    private Boolean cancelled;
    private Boolean noShow;
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
}
