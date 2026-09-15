package com.labresource.backend.billing.dto;

import com.labresource.backend.billing.entity.CostRecord;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class CostRecordDto {
    private Long costId;
    private Long equipmentId;
    private String equipmentName;
    private Long departmentId;
    private String departmentName;
    private Long labId;
    private String labName;
    private Long institutionId;
    private String institutionName;
    private Long bookingId;
    private Long maintenanceId;
    private Long sharingAgreementId;
    private String costType;
    private BigDecimal amount;
    private String currency;
    private String billingPeriod;
    private LocalDateTime createdAt;

    public static CostRecordDto fromEntity(CostRecord entity, String equipmentName, String deptName, String labName, String instName) {
        if (entity == null) return null;

        CostRecordDto dto = new CostRecordDto();
        dto.setCostId(entity.getCostId());
        dto.setEquipmentId(entity.getEquipmentId());
        dto.setEquipmentName(equipmentName);
        dto.setDepartmentId(entity.getDepartmentId());
        dto.setDepartmentName(deptName);
        dto.setLabId(null);
        dto.setLabName(labName);
        dto.setInstitutionId(entity.getInstitutionId());
        dto.setInstitutionName(instName);
        dto.setBookingId(entity.getBookingId());
        dto.setMaintenanceId(entity.getMaintenanceId());
        dto.setSharingAgreementId(entity.getSharingAgreementId());
        dto.setCostType(entity.getCostType());
        dto.setAmount(entity.getAmount());
        dto.setCurrency(entity.getCurrency() != null ? entity.getCurrency() : "INR");
        dto.setBillingPeriod(entity.getBillingPeriod());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
