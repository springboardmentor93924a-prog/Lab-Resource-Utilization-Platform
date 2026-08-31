package com.infosys.labresource.Equipment.dtos;

import lombok.Data;

import java.time.LocalDate;
@Data
public class CalibRecordRequestDTO {
    private Long equipmentId;

    private LocalDate lastCalibrationDate;

    private LocalDate nextCalibrationDate;

    private Integer calibrationIntervalMonths;

    private String certificationNumber;

    private LocalDate certificationIssueDate;

    private LocalDate certificationExpiryDate;

    private Boolean certificationRequired;
}
