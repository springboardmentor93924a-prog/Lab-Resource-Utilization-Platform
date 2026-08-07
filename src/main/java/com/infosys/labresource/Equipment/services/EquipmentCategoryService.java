package com.infosys.labresource.Equipment.services;

import com.infosys.labresource.Equipment.entity.EquipmentCategory;

import java.util.List;

public interface EquipmentCategoryService {
    EquipmentCategory addCategory(EquipmentCategory category);

    List<EquipmentCategory> getAllCategories();

    EquipmentCategory getCategoryById(Long categoryId);

    EquipmentCategory updateCategory(Long categoryId, EquipmentCategory category);

    void deleteCategory(Long categoryId);
}
