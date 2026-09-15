package com.labresource.backend.maintenance.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TechnicianCompletionDto {
    private String diagnosticNotes;
    private String workPerformed;
    private String partsUsed;
}
