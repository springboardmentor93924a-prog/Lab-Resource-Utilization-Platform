package com.labresource.backend.maintenance.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class MaintenanceEditDto {
    private String issueDescription;
    private String priority;
    private String issueType;
    private LocalDateTime scheduledStartDatetime;
    private LocalDateTime scheduledEndDatetime;
    private LocalDate scheduledDate;
    private LocalDate finalDueDate;
    private String managerNotes;
}
