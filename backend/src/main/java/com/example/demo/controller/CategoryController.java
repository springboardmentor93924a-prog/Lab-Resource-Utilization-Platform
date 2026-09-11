package com.example.demo.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.entity.EquipmentCategory;
import com.example.demo.repository.EquipmentCategoryRepository;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    @Autowired
    private EquipmentCategoryRepository categoryRepository;

    @GetMapping
    public List<EquipmentCategory> getAll() {
        return categoryRepository.findAll();
    }
}
