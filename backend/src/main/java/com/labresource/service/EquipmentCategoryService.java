package com.labresource.service;

import com.labresource.dto.equipmentcategory.EquipmentCategoryRequest;
import com.labresource.dto.equipmentcategory.EquipmentCategoryResponse;

import java.util.List;

public interface EquipmentCategoryService {

    EquipmentCategoryResponse createCategory(
            EquipmentCategoryRequest request
    );

    List<EquipmentCategoryResponse> getAllCategories();

    EquipmentCategoryResponse getCategoryById(
            String categoryId
    );

    EquipmentCategoryResponse updateCategory(
            String categoryId,
            EquipmentCategoryRequest request
    );

    void deleteCategory(
            String categoryId
    );
}


//createCategory
//getAllCategories
//getCategoryById
//updateCategory
//deleteCategory