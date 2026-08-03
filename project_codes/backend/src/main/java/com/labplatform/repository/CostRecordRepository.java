package com.labplatform.repository;

import com.labplatform.entity.CostRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CostRecordRepository extends JpaRepository<CostRecord, Long> {
    List<CostRecord> findByEquipmentId(Long equipmentId);
    List<CostRecord> findByDepartment(String department);
}
