package com.infosys.labresource.ResourceSharing.dtos;

import com.infosys.labresource.ResourceSharing.Entity.SharingRequestStatus;
import lombok.Data;

import java.time.LocalDateTime;
@Data
public class SharingResponseDTO {
    private Long requestId;

    private Long equipmentId;
    private String equipmentName;

    private Long requestingInstitutionId;
    private String requestingInstitutionName;

    private Long requestedById;

    private Long approvedById;

    private SharingRequestStatus status;
    private Long equipmentInstitutionId;
    private LocalDateTime requestedAt;
    private LocalDateTime actionedAt;
}
