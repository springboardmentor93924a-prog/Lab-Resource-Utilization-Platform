package com.labresource.dto.equipmentcategory;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentCategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    private String description;
}


//reqbody
//{
//  "name": "Microscopy Equipment",
//  "description": "Equipment used for microscopic analysis"
//}