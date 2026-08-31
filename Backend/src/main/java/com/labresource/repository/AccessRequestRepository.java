package com.labresource.repository;

import com.labresource.entity.AccessRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccessRequestRepository
        extends JpaRepository<AccessRequest, Long> {

    List<AccessRequest> findByUserId(Long userId);

    List<AccessRequest> findByStatus(String status);

    List<AccessRequest> findBySharedEquipmentId(
            Long sharedEquipmentId
    );

    boolean existsByUserIdAndSharedEquipmentIdAndStatus(
            Long userId,
            Long sharedEquipmentId,
            String status
    );
}