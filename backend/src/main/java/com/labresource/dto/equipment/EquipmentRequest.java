package com.labresource.dto.equipment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentRequest {

    @NotBlank(message = "Equipment name is required")
    private String name;

    private String description;

    @NotBlank(message = "Serial number is required")
    private String serialNumber;

    private String manufacturer;

    private String modelNumber;

    private LocalDate purchaseDate;

    @DecimalMin(value = "0.0", message = "Purchase cost cannot be negative")
    private BigDecimal purchaseCost;

    private String location;

    private String status;

    private String availabilityStatus;

    private String imageUrl;

    @NotBlank(message = "Category ID is required")
    private String categoryId;

    @NotBlank(message = "Institution ID is required")
    private String institutionId;

    @NotBlank(message = "Department ID is required")
    private String departmentId;
}


//{
//  "name": "Digital Microscope",
//  "description": "High precision microscope",
//  "serialNumber": "MIC-10001",
//  "manufacturer": "Olympus",
//  "modelNumber": "DP74",
//  "purchaseDate": "2026-07-29",
//  "purchaseCost": 250000,
//  "location": "Lab A",
//  "status": "ACTIVE",
//  "availabilityStatus": "AVAILABLE",
//  "imageUrl": "https://example.com/microscope.jpg",
//  "categoryId": "CATEGORY_ID",
//  "institutionId": "INSTITUTION_ID",
//  "departmentId": "DEPARTMENT_ID"
//}