package com.labresource.repository;

import com.labresource.entity.Institution;
import com.labresource.entity.ResourceSharingRequest;
import com.labresource.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceSharingRequestRepository
        extends JpaRepository<ResourceSharingRequest, String> {

    List<ResourceSharingRequest> findByRequester(
            User requester
    );

    List<ResourceSharingRequest> findByRequesterInstitution(
            Institution requesterInstitution
    );

    List<ResourceSharingRequest> findByProviderInstitution(
            Institution providerInstitution
    );

    List<ResourceSharingRequest> findByStatus(
            String status
    );

    List<ResourceSharingRequest> findByStatusIgnoreCase(
            String status
    );

    List<ResourceSharingRequest> findByApprovedBy(
            User approvedBy
    );

    List<ResourceSharingRequest> findByRequesterAndStatusIgnoreCase(
            User requester,
            String status
    );

    List<ResourceSharingRequest> findByProviderInstitutionAndStatusIgnoreCase(
            Institution providerInstitution,
            String status
    );
}