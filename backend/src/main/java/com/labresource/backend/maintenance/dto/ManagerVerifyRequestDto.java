package com.labresource.backend.maintenance.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ManagerVerifyRequestDto {
    private Boolean approved;
    private String equipmentStatus;
    private String rejectionReason;
    private String managerNotes;
    private String resolutionSummary;
    private Boolean confirmationAcknowledged;
}
