package com.labresource.dto.equipment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentResponse {

    private String id;

    private String name;

    private String description;

    private String serialNumber;

    private String manufacturer;

    private String modelNumber;

    private LocalDate purchaseDate;

    private BigDecimal purchaseCost;

    private String location;

    private String status;

    private String availabilityStatus;

    private String imageUrl;

    private String categoryId;

    private String categoryName;

    private String institutionId;

    private String institutionName;

    private String departmentId;

    private String departmentName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
//{
//  "id": "equipment-id",
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
//  "categoryId": "category-id",
//  "categoryName": "Microscopy Equipment",
//  "institutionId": "institution-id",
//  "institutionName": "DY Patil International University",
//  "departmentId": "department-id",
//  "departmentName": "Computer Science and Engineering",
//  "createdAt": "2026-07-29T23:50:00",
//  "updatedAt": "2026-07-29T23:50:00"
//}