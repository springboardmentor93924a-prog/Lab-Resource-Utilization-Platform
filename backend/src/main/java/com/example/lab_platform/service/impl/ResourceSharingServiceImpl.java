package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.Institution;
import com.example.lab_platform.entity.ResourceSharingRequest;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.InstitutionRepository;
import com.example.lab_platform.repository.ResourceSharingRepository;
import com.example.lab_platform.service.ResourceSharingService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ResourceSharingServiceImpl implements ResourceSharingService {

    private final ResourceSharingRepository repository;
    private final InstitutionRepository institutionRepository;
    private final EquipmentRepository equipmentRepository;

    public ResourceSharingServiceImpl(
            ResourceSharingRepository repository,
            InstitutionRepository institutionRepository,
            EquipmentRepository equipmentRepository) {
        this.repository = repository;
        this.institutionRepository = institutionRepository;
        this.equipmentRepository = equipmentRepository;
    }

    private User getLoggedInUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    private String getRole(User user) {
        return user.getRole().getRoleName();
    }

    private boolean isSystemAdmin(String role) {
        return "SYSTEM_ADMIN".equalsIgnoreCase(role);
    }

    /*
     * Sender = the institution that OWNS the equipment being shared
     * (validated below against the equipment's actual institution).
     * Receiver = the institution asking for access.
     * This matches the convention already established and relied on
     * in BookingServiceImpl.createBooking()'s cross-institution check.
     */
    @Override
    public ResourceSharingRequest createRequest(ResourceSharingRequest request) {
        if (request.getEquipment() == null || request.getEquipment().getEquipmentId() == null) {
            throw new RuntimeException("Equipment is required");
        }
        if (request.getSenderInstitution() == null || request.getSenderInstitution().getInstitutionId() == null) {
            throw new RuntimeException("Sender institution is required");
        }

        User loggedInUser = getLoggedInUser();
        String role = getRole(loggedInUser);

        Integer senderId = request.getSenderInstitution().getInstitutionId();

        /*
         * The receiver institution (the party asking for access) is
         * never trusted from the request body — it's always the
         * caller's own institution. A manager can only request
         * access on behalf of their own institution, not spoof a
         * request as coming from someone else. SYSTEM_ADMIN is
         * exempt since they operate platform-wide and may set up
         * sharing between two institutions directly.
         */
        Integer receiverId;

        if (isSystemAdmin(role)) {
            if (request.getReceiverInstitution() == null
                    || request.getReceiverInstitution().getInstitutionId() == null) {
                throw new RuntimeException("Receiver institution is required");
            }
            receiverId = request.getReceiverInstitution().getInstitutionId();
        } else {
            if (loggedInUser.getInstitution() == null) {
                throw new RuntimeException("Your account has no institution on file");
            }
            receiverId = loggedInUser.getInstitution().getInstitutionId();
        }

        if (senderId.equals(receiverId)) {
            throw new RuntimeException("Sender and receiver institutions must be different");
        }

        Institution sender = institutionRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender institution not found"));
        Institution receiver = institutionRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver institution not found"));

        Equipment equipment = equipmentRepository.findById(request.getEquipment().getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        if (equipment.getInstitution() == null
                || !equipment.getInstitution().getInstitutionId().equals(senderId)) {
            throw new RuntimeException(
                    "This equipment does not belong to the selected sender institution"
            );
        }

        request.setEquipment(equipment);
        request.setSenderInstitution(sender);
        request.setReceiverInstitution(receiver);
        request.setStatus("PENDING");

        return repository.save(request);
    }

    /*
     * Only requests where the caller's own institution is on one
     * side (sender or receiver) are visible. SYSTEM_ADMIN sees
     * everything, since they operate platform-wide.
     */
    @Override
    public List<ResourceSharingRequest> getAllRequests() {
        User loggedInUser = getLoggedInUser();
        String role = getRole(loggedInUser);

        if (isSystemAdmin(role)) {
            return repository.findAll();
        }

        if (loggedInUser.getInstitution() == null) {
            return new ArrayList<>();
        }

        Integer institutionId = loggedInUser.getInstitution().getInstitutionId();

        List<ResourceSharingRequest> result = new ArrayList<>(
                repository.findBySenderInstitution_InstitutionId(institutionId)
        );

        List<ResourceSharingRequest> asReceiver =
                repository.findByReceiverInstitution_InstitutionId(institutionId);

        for (ResourceSharingRequest r : asReceiver) {
            if (result.stream().noneMatch(existing -> existing.getId().equals(r.getId()))) {
                result.add(r);
            }
        }

        return result;
    }

    /*
     * Only the equipment-owning (sender) institution's staff can
     * approve or reject a request against their own equipment.
     * SYSTEM_ADMIN can act on any request. Status can only move out
     * of PENDING, and only to APPROVED or REJECTED.
     */
    @Override
    public ResourceSharingRequest updateStatus(Long id, String status) {
        ResourceSharingRequest req = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User loggedInUser = getLoggedInUser();
        String role = getRole(loggedInUser);

        if (!isSystemAdmin(role)) {
            if (loggedInUser.getInstitution() == null
                    || req.getSenderInstitution() == null
                    || !loggedInUser.getInstitution().getInstitutionId()
                            .equals(req.getSenderInstitution().getInstitutionId())) {

                throw new RuntimeException(
                        "Only the equipment's owning institution can approve or reject this request"
                );
            }
        }

        if (!"PENDING".equalsIgnoreCase(req.getStatus())) {
            throw new RuntimeException("This request has already been " + req.getStatus());
        }

        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();

        if (!normalizedStatus.equals("APPROVED") && !normalizedStatus.equals("REJECTED")) {
            throw new RuntimeException("Status must be APPROVED or REJECTED");
        }

        req.setStatus(normalizedStatus);
        return repository.save(req);
    }
}
