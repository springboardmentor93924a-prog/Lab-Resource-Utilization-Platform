package com.infosys.labresource.Equipment.dtos;

import com.infosys.labresource.Equipment.entity.EquipmentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
@Data
public class EquipmentRequestDTO {
    private String equipmentName;

    private String assetTag;

    private Long categoryId;

    private Long institutionId;

    private Long departmentId;

    private EquipmentStatus status;

    private BigDecimal hourlyRate;

    private LocalDate purchaseDate;

    private BigDecimal purchaseCost;

    private LocalDate warrantyExpiry;
}
