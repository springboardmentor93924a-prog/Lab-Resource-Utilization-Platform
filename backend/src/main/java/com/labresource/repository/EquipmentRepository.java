package com.labresource.repository;

import com.labresource.entity.Department;
import com.labresource.entity.Equipment;
import com.labresource.entity.EquipmentCategory;
import com.labresource.entity.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository
        extends JpaRepository<Equipment, String> {

    boolean existsBySerialNumber(
            String serialNumber
    );

    boolean existsBySerialNumberAndIdNot(
            String serialNumber,
            String equipmentId
    );

    List<Equipment> findByInstitution(
            Institution institution
    );

    List<Equipment> findByDepartment(
            Department department
    );

    List<Equipment> findByCategory(
            EquipmentCategory category
    );

    List<Equipment> findByAvailabilityStatusIgnoreCase(
            String availabilityStatus
    );

    List<Equipment> findByStatusIgnoreCase(
            String status
    );
}