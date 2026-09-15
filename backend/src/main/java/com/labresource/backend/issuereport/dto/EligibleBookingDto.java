package com.labresource.backend.issuereport.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EligibleBookingDto {
    private Long bookingId;
    private Long equipmentId;
    private String equipmentName;
    private String category;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String serialNumber;
    private Long departmentId;
    private String departmentName;
    private Long labId;
    private String labName;
    private String status;

    public EligibleBookingDto(Long bookingId, Long equipmentId, String equipmentName, String category, String location, LocalDateTime startTime, LocalDateTime endTime) {
        this.bookingId = bookingId;
        this.equipmentId = equipmentId;
        this.equipmentName = equipmentName;
        this.category = category;
        this.location = location;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}
