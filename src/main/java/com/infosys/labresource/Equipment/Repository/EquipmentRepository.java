package com.infosys.labresource.Equipment.Repository;

import com.infosys.labresource.Equipment.dtos.EquipmentRequestDTO;
import com.infosys.labresource.Equipment.dtos.EquipmentResponseDTO;
import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment,Long> {
    List<Equipment> findByDepartment(Department department);

    List<Equipment> findByInstitution(Institution institution);
}
