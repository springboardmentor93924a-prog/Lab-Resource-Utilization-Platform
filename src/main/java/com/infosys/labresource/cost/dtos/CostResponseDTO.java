package com.infosys.labresource.cost.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CostResponseDTO {
    private Long costId;
    private Long bookingId;
    private Long equipId;
    private String equipName;
    private Long departmentId;
    private String departmentName;
    private Long usedByInstitutionId;
    private Long ownerInstitutionId;
    private Double hoursUsed;
    private BigDecimal hourlyRate;
    private BigDecimal totalCost;
    private boolean crossInstitution;
    private LocalDateTime createdAt;
}