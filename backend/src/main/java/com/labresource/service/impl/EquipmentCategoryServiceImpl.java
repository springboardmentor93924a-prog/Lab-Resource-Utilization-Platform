package com.labresource.service.impl;

import com.labresource.dto.equipmentcategory.EquipmentCategoryRequest;
import com.labresource.dto.equipmentcategory.EquipmentCategoryResponse;
import com.labresource.entity.EquipmentCategory;
import com.labresource.exception.ResourceNotFoundException;
import com.labresource.repository.EquipmentCategoryRepository;
import com.labresource.service.EquipmentCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentCategoryServiceImpl
        implements EquipmentCategoryService {

    private final EquipmentCategoryRepository
            equipmentCategoryRepository;

    @Override
    public EquipmentCategoryResponse createCategory(
            EquipmentCategoryRequest request
    ) {

        EquipmentCategory category =
                new EquipmentCategory();

        category.setName(request.getName());
        category.setDescription(
                request.getDescription()
        );

        EquipmentCategory savedCategory =
                equipmentCategoryRepository.save(category);

        return mapToResponse(savedCategory);
    }

    @Override
    public List<EquipmentCategoryResponse>
    getAllCategories() {

        return equipmentCategoryRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public EquipmentCategoryResponse getCategoryById(
            String categoryId
    ) {

        EquipmentCategory category =
                equipmentCategoryRepository
                        .findById(categoryId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Equipment Category not found"
                                )
                        );

        return mapToResponse(category);
    }

    @Override
    public EquipmentCategoryResponse updateCategory(
            String categoryId,
            EquipmentCategoryRequest request
    ) {

        EquipmentCategory category =
                equipmentCategoryRepository
                        .findById(categoryId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Equipment Category not found"
                                )
                        );

        category.setName(request.getName());
        category.setDescription(
                request.getDescription()
        );

        EquipmentCategory updatedCategory =
                equipmentCategoryRepository.save(category);

        return mapToResponse(updatedCategory);
    }

    @Override
    public void deleteCategory(
            String categoryId
    ) {

        EquipmentCategory category =
                equipmentCategoryRepository
                        .findById(categoryId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Equipment Category not found"
                                )
                        );

        equipmentCategoryRepository.delete(category);
    }

    private EquipmentCategoryResponse mapToResponse(
            EquipmentCategory category
    ) {

        return new EquipmentCategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getCreatedAt()
        );
    }
}