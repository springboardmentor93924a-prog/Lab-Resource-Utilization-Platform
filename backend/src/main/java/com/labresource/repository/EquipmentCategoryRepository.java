package com.labresource.repository;

import com.labresource.entity.EquipmentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentCategoryRepository
        extends JpaRepository<EquipmentCategory, String> {

    boolean existsByName(String name);
}