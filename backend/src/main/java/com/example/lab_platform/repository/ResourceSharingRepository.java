package com.example.lab_platform.repository;

import com.example.lab_platform.entity.ResourceSharingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceSharingRepository extends JpaRepository<ResourceSharingRequest, Long> {
    // Custom query to find requests by receiver or sender institution if needed
    List<ResourceSharingRequest> findByReceiverInstitution(String receiverInstitution);
    List<ResourceSharingRequest> findBySenderInstitution(String senderInstitution);
}