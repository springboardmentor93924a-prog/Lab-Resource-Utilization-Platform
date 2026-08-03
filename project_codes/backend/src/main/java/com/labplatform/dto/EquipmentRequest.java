package com.labplatform.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EquipmentRequest {
    private String name;
    private String category;
    private String tags;
    private String specifications;
    private String serialNumber;
    private String manufacturer;
    private LocalDate purchaseDate;
    private BigDecimal purchaseCost;
    private Long institutionId;
    private String department;
    private boolean sharableAcrossInstitutions;
    private BigDecimal hourlyUsageCost;
    private LocalDate lastCalibrationDate;
    private LocalDate nextCalibrationDue;
}
