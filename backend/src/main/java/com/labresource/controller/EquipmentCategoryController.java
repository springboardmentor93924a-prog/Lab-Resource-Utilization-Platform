package com.labresource.controller;

import com.labresource.dto.equipmentcategory.EquipmentCategoryRequest;
import com.labresource.dto.equipmentcategory.EquipmentCategoryResponse;
import com.labresource.service.EquipmentCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class EquipmentCategoryController {

    private final EquipmentCategoryService equipmentCategoryService;

    @PostMapping
    public ResponseEntity<EquipmentCategoryResponse> createCategory(
            @Valid @RequestBody EquipmentCategoryRequest request
    ) {

        EquipmentCategoryResponse response =
                equipmentCategoryService.createCategory(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<EquipmentCategoryResponse>> getAllCategories() {

        return ResponseEntity.ok(
                equipmentCategoryService.getAllCategories()
        );
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<EquipmentCategoryResponse> getCategoryById(
            @PathVariable String categoryId
    ) {

        return ResponseEntity.ok(
                equipmentCategoryService.getCategoryById(categoryId)
        );
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<EquipmentCategoryResponse> updateCategory(
            @PathVariable String categoryId,
            @Valid @RequestBody EquipmentCategoryRequest request
    ) {

        EquipmentCategoryResponse response =
                equipmentCategoryService.updateCategory(
                        categoryId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable String categoryId
    ) {

        equipmentCategoryService.deleteCategory(categoryId);

        return ResponseEntity.noContent().build();
    }
}