package com.infosys.labresource.Equipment.dtos;

import com.infosys.labresource.Equipment.entity.EquipmentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
@Data
public class EquipmentResponseDTO {
    private Long equipmentId;

    private String equipmentName;

    private String assetTag;

    private Long categoryId;

    private String categoryName;

    private Long institutionId;

    private String institutionName;

    private Long departmentId;

    private String departmentName;

    private EquipmentStatus status;

    private BigDecimal hourlyRate;

    private LocalDate purchaseDate;

    private BigDecimal purchaseCost;

    private LocalDate warrantyExpiry;
}
