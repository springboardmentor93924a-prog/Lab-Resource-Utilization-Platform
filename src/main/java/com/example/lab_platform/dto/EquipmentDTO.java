package com.example.lab_platform.dto;

import com.example.lab_platform.entity.EquipmentStatus;
import lombok.Data;

@Data
public class EquipmentDTO {
    private Long id;
    private String name;
    private String serialNumber;
    private Long categoryId;
    private Long locationId;
    private EquipmentStatus status;
}