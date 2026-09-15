package com.labresource.backend.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UtilizationEffectivenessReportDto {

    private ReportMetadataDto metadata;
    private UtilizationSummaryDto summary;
    private EquipmentUtilizationRankDto mostUtilizedEquipment;
    private EquipmentUtilizationRankDto leastUtilizedEquipment;
    private List<EquipmentUtilizationItemDto> equipmentUtilization;
    private List<UtilizationTrendPointDto> utilizationTrend;
    private List<EquipmentUtilizationItemDto> underutilizedEquipment;
    private List<EquipmentUtilizationItemDto> highlyUtilizedEquipment;
    private List<DepartmentUtilizationComparisonDto> departmentComparison;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtilizationSummaryDto {
        private Double averageUtilizationPercentage;
        private Double totalUsedHours;
        private Double totalAvailableHours;
        private Double totalIdleHours;
        private Long totalEquipmentCount;
        private Long totalLaboratoryCount;
        private Long totalBookingCount;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentUtilizationRankDto {
        private Long equipmentId;
        private String equipmentName;
        private Long laboratoryId;
        private String laboratoryName;
        private Long departmentId;
        private String departmentName;
        private Double utilizationPercentage;
        private Double usedHours;
        private Double availableHours;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentUtilizationItemDto {
        private Long equipmentId;
        private String equipmentName;
        private Long laboratoryId;
        private String laboratoryName;
        private Long departmentId;
        private String departmentName;
        private Double usedHours;
        private Double availableHours;
        private Double idleHours;
        private Double utilizationPercentage;
        private Long bookingCount;
        private String utilizationStatus; // LOW, MODERATE, GOOD, HIGH
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtilizationTrendPointDto {
        private String period; // e.g. "2026-09-01" or "2026-09"
        private Double usedHours;
        private Double availableHours;
        private Double idleHours;
        private Double utilizationPercentage;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentUtilizationComparisonDto {
        private Long departmentId;
        private String departmentName;
        private Long equipmentCount;
        private Long laboratoryCount;
        private Double usedHours;
        private Double availableHours;
        private Double idleHours;
        private Double utilizationPercentage;
    }
}
