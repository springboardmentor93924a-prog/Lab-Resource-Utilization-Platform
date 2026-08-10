package com.infosys.labresource.Equipment.Repository;

import com.infosys.labresource.Equipment.entity.EquipmentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipCategoryRepository extends JpaRepository<EquipmentCategory,Long> {
}
