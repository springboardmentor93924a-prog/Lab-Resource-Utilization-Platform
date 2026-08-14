package com.infosys.labresource.ResourceSharing.Repository;

import com.infosys.labresource.ResourceSharing.Entity.ResourceSharingRequest;
import com.infosys.labresource.ResourceSharing.Entity.SharingRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceSharingRepo extends JpaRepository<ResourceSharingRequest,Long> {
    List<ResourceSharingRequest> findByStatus(SharingRequestStatus status);

    List<ResourceSharingRequest> findByEquipment_EquipId(Long equipmentId);

    List<ResourceSharingRequest> findByRequestingInstitution_InstitutionId(Long institutionId);

    boolean existsByEquipment_EquipIdAndRequestingInstitution_InstitutionIdAndStatus(
            Long equipmentId,
            Long institutionId,
            SharingRequestStatus status
    );

}
