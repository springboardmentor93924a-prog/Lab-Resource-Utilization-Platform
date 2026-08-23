package com.labresource.backend.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceReportDTO {
    private List<CalibrationItem> calibrations;
    private List<CertificationItem> certifications;
    private Map<String, Long> summaryCounts;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CalibrationItem {
        private String equipmentName;
        private Long equipmentId;
        private LocalDate lastCalibrationDate;
        private LocalDate nextDueDate;
        private String calibrationStatus;
        private String dueSoonOrOverdueState;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CertificationItem {
        private String equipmentName;
        private Long equipmentId;
        private String certificationName;
        private String certificateNumber;
        private LocalDate issueDate;
        private LocalDate expiryDate;
        private String certificationStatus;
    }
}
