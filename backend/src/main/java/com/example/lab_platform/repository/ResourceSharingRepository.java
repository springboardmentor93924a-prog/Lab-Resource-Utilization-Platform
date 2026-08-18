package com.example.lab_platform.repository;

import com.example.lab_platform.entity.ResourceSharingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceSharingRepository extends JpaRepository<ResourceSharingRequest, Long> {
    List<ResourceSharingRequest> findByReceiverInstitution_InstitutionId(Integer institutionId);
    List<ResourceSharingRequest> findBySenderInstitution_InstitutionId(Integer institutionId);

    boolean existsBySenderInstitution_InstitutionIdAndReceiverInstitution_InstitutionIdAndEquipment_EquipmentIdAndStatus(
            Integer senderInstitutionId,
            Integer receiverInstitutionId,
            Integer equipmentId,
            String status
    );
}