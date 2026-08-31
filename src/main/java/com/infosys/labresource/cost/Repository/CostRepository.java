package com.infosys.labresource.cost.Repository;

import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.cost.entity.UsageCost;
import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CostRepository extends JpaRepository<UsageCost, Long> {

    List<UsageCost> findByUsedByDepartment(Department dept);

    List<UsageCost> findByUsedByInstitution(Institution inst);

    List<UsageCost> findByEquipment(Equipment equip);

    // this is the inter institution billing view, money owed TO the owner institution
    // from usage done by people belonging to some other institution
    List<UsageCost> findByOwnerInstitutionAndCrossInstitutionTrue(Institution ownerInst);
}