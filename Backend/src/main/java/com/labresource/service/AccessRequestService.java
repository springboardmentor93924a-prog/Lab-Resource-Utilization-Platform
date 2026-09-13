
package com.labresource.service;

import com.labresource.entity.AccessRequest;
import com.labresource.entity.SharedEquipment;
import com.labresource.entity.User;
import com.labresource.repository.AccessRequestRepository;
import com.labresource.repository.SharedEquipmentRepository;
import com.labresource.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AccessRequestService {

    private final AccessRequestRepository accessRequestRepository;
    private final SharedEquipmentRepository sharedEquipmentRepository;
    private final UserRepository userRepository;

    public AccessRequestService(
            AccessRequestRepository accessRequestRepository,
            SharedEquipmentRepository sharedEquipmentRepository,
            UserRepository userRepository
    ) {
        this.accessRequestRepository = accessRequestRepository;
        this.sharedEquipmentRepository = sharedEquipmentRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE ACCESS REQUEST
    // =========================================================

    public AccessRequest createRequest(
            Long userId,
            Long sharedEquipmentId,
            String requestReason
    ) {

        // -----------------------------------------------------
        // FIND USER
        // -----------------------------------------------------

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );

        // -----------------------------------------------------
        // FIND SHARED EQUIPMENT
        // -----------------------------------------------------

        SharedEquipment sharedEquipment =
                sharedEquipmentRepository.findById(
                        sharedEquipmentId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Shared equipment not found"
                        )
                );

        // -----------------------------------------------------
        // CHECK SHARING STATUS
        // -----------------------------------------------------

        if (!Boolean.TRUE.equals(
                sharedEquipment.getAvailable()
        )) {

            throw new RuntimeException(
                    "Shared equipment is currently unavailable"
            );
        }

        if (sharedEquipment.getSharingStatus() == null ||
                !sharedEquipment.getSharingStatus()
                        .equalsIgnoreCase("ACTIVE")) {

            throw new RuntimeException(
                    "Shared equipment is not currently active"
            );
        }

        // -----------------------------------------------------
        // PREVENT DUPLICATE PENDING REQUEST
        // -----------------------------------------------------

        boolean duplicate =
                accessRequestRepository
                        .existsByUserIdAndSharedEquipmentIdAndStatus(
                                userId,
                                sharedEquipmentId,
                                "PENDING"
                        );

        if (duplicate) {

            throw new RuntimeException(
                    "You already have a pending access request for this equipment"
            );
        }

        // -----------------------------------------------------
        // CREATE REQUEST
        // -----------------------------------------------------

        AccessRequest request =
                new AccessRequest();

        request.setUser(user);

        request.setSharedEquipment(
                sharedEquipment
        );

        request.setRequestReason(
                requestReason
        );

        request.setStatus(
                "PENDING"
        );

        request.setRequestedAt(
                LocalDateTime.now()
        );

        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        return accessRequestRepository.save(
                request
        );
    }

    // =========================================================
    // GET ALL ACCESS REQUESTS
    // =========================================================

    public List<AccessRequest> getAllRequests() {

        return accessRequestRepository.findAll();
    }

    // =========================================================
    // GET REQUEST BY ID
    // =========================================================

    public AccessRequest getRequestById(
            Long id
    ) {

        return accessRequestRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Access request not found"
                        )
                );
    }

    // =========================================================
    // GET REQUESTS BY USER
    // =========================================================

    public List<AccessRequest> getRequestsByUser(
            Long userId
    ) {

        if (!userRepository.existsById(userId)) {

            throw new RuntimeException(
                    "User not found"
            );
        }

        return accessRequestRepository
                .findByUserId(userId);
    }

    // =========================================================
    // APPROVE ACCESS REQUEST
    // =========================================================

    public AccessRequest approveRequest(
            Long id,
            String adminResponse
    ) {

        AccessRequest request =
                getRequestById(id);

        // -----------------------------------------------------
        // CHECK CURRENT STATUS
        // -----------------------------------------------------

        if (!request.getStatus()
                .equalsIgnoreCase("PENDING")) {

            throw new RuntimeException(
                    "Only pending requests can be approved"
            );
        }

        // -----------------------------------------------------
        // CHECK SHARED EQUIPMENT
        // -----------------------------------------------------

        SharedEquipment sharedEquipment =
                request.getSharedEquipment();

        if (sharedEquipment == null) {

            throw new RuntimeException(
                    "Shared equipment not found for this request"
            );
        }

        if (!Boolean.TRUE.equals(
                sharedEquipment.getAvailable()
        )) {

            throw new RuntimeException(
                    "Shared equipment is no longer available"
            );
        }

        if (sharedEquipment.getSharingStatus() == null ||
                !sharedEquipment.getSharingStatus()
                        .equalsIgnoreCase("ACTIVE")) {

            throw new RuntimeException(
                    "Shared equipment is no longer active"
            );
        }

        // -----------------------------------------------------
        // APPROVE
        // -----------------------------------------------------

        request.setStatus(
                "APPROVED"
        );

        request.setAdminResponse(
                adminResponse
        );

        request.setRespondedAt(
                LocalDateTime.now()
        );

        return accessRequestRepository.save(
                request
        );
    }

    // =========================================================
    // REJECT ACCESS REQUEST
    // =========================================================

    public AccessRequest rejectRequest(
            Long id,
            String adminResponse
    ) {

        AccessRequest request =
                getRequestById(id);

        // -----------------------------------------------------
        // CHECK CURRENT STATUS
        // -----------------------------------------------------

        if (!request.getStatus()
                .equalsIgnoreCase("PENDING")) {

            throw new RuntimeException(
                    "Only pending requests can be rejected"
            );
        }

        // -----------------------------------------------------
        // REJECT
        // -----------------------------------------------------

        request.setStatus(
                "REJECTED"
        );

        request.setAdminResponse(
                adminResponse
        );

        request.setRespondedAt(
                LocalDateTime.now()
        );

        return accessRequestRepository.save(
                request
        );
    }

    // =========================================================
    // GET PENDING REQUESTS
    // =========================================================

    public List<AccessRequest> getPendingRequests() {

        return accessRequestRepository
                .findByStatus("PENDING");
    }
}
