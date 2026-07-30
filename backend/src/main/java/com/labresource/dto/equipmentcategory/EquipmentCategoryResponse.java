package com.labresource.dto.equipmentcategory;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentCategoryResponse {

    private String id;

    private String name;

    private String description;

    private LocalDateTime createdAt;
}