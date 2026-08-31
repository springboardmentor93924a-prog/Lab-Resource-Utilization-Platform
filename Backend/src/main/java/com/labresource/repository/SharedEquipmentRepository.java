
package com.labresource.repository;

import com.labresource.entity.SharedEquipment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SharedEquipmentRepository
        extends JpaRepository<SharedEquipment, Long> {

    List<SharedEquipment>
    findByAvailableTrue();

    List<SharedEquipment>
    findByOwnerInstitutionId(Long institutionId);

    List<SharedEquipment>
    findBySharedWithInstitutionId(Long institutionId);

    List<SharedEquipment>
    findByEquipmentId(Long equipmentId);

    List<SharedEquipment>
    findBySharingStatus(String sharingStatus);
}
