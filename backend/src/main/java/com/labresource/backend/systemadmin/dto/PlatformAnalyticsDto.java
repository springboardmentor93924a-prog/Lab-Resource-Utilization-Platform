package com.labresource.backend.systemadmin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlatformAnalyticsDto {

    private InstitutionStatsDto institutions;
    private UserStatsDto users;
    private LaboratoryStatsDto laboratories;
    private EquipmentStatsDto equipment;
    private BookingStatsDto bookings;
    private ActivityStatsDto activity;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InstitutionStatsDto {
        private long total;
        private long approved;
        private long pending;
        private long rejected;
        private long active;
        private long inactive;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStatsDto {
        private long total;
        private long active;
        private long inactive;
        private Map<String, Long> usersByRole;
        private Map<String, Long> usersByInstitution;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LaboratoryStatsDto {
        private long total;
        private Map<String, Long> laboratoriesByInstitution;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentStatsDto {
        private long total;
        private Map<String, Long> equipmentByStatus;
        private Map<String, Long> equipmentByInstitution;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingStatsDto {
        private long total;
        private long confirmed;
        private long completed;
        private long cancelled;
        private long noShow;
        private long pendingApproval;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityStatsDto {
        private long totalAuditLogs;
        private Map<String, Long> auditLogsByAction;
    }
}
