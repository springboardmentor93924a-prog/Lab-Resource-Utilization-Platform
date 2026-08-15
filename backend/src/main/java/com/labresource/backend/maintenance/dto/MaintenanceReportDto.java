package com.labresource.backend.maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaintenanceReportDto {
    @NotNull
    private Long equipmentId;

    private String issueType;

    @NotBlank
    private String issueDescription;

    private String priority = "MEDIUM";

    private String attachmentUrl;
}
