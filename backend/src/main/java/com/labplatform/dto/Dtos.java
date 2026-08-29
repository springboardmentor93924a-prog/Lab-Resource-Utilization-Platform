package com.labplatform.dto;

import com.labplatform.entity.BookingStatus;
import com.labplatform.entity.Role;
import lombok.*;
import java.time.LocalDateTime;

public class Dtos {
    public record LoginRequest(String email, String password) {}
    public record AuthResponse(String token, String type, UserDto user) {}
    public record UserDto(Long id, String email, String fullName, Role role, String department, String institutionName) {}
    public record BookingRequest(Long equipmentId, LocalDateTime startTime, LocalDateTime endTime, String purpose) {}
    public record BookingStatusUpdate(BookingStatus status) {}
    public record MaintenanceRequest(Long equipmentId, String description, LocalDateTime scheduledDate, Long technicianId) {}
    public record MaintenanceCompleteRequest(String serviceNotes) {}

    @Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
    public static class UtilizationStats {
        private Long equipmentId;
        private String equipmentName;
        private Double totalHoursBooked;
        private Double totalCapacityHours;
        private Double utilizationPercentage;
        private Double idleHours;
    }
}