package com.labplatform.repository;

import com.labplatform.entity.SharingRequest;
import com.labplatform.entity.SharingRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SharingRequestRepository extends JpaRepository<SharingRequest, Long> {
    List<SharingRequest> findByRequestingInstitutionId(Long institutionId);
    List<SharingRequest> findByEquipmentId(Long equipmentId);
    List<SharingRequest> findByStatus(SharingRequestStatus status);
}
