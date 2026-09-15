package com.labresource.backend.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportMetadataDto {
    private String reportType;
    private LocalDateTime generatedAt;
    private LocalDate from;
    private LocalDate to;
    private Long institutionId;
    private String institutionName;
    private Long departmentId;
    private String departmentName;
    private Long laboratoryId;
    private String laboratoryName;
    private Long generatedByUserId;
    private String generatedByRole;
}
