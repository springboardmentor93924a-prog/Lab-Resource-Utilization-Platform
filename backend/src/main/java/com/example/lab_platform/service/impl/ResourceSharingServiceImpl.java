package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.Institution;
import com.example.lab_platform.entity.ResourceSharingRequest;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.InstitutionRepository;
import com.example.lab_platform.repository.ResourceSharingRepository;
import com.example.lab_platform.repository.UserRepository;
import com.example.lab_platform.service.NotificationService;
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
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ResourceSharingServiceImpl(
            ResourceSharingRepository repository,
            InstitutionRepository institutionRepository,
            EquipmentRepository equipmentRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.repository = repository;
        this.institutionRepository = institutionRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
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
     * No single "requester" user is stored on ResourceSharingRequest
     * (only sender/receiver institutions) — so notifications here are
     * institution-wide, to every LAB_MANAGER/INSTITUTION_ADMIN at the
     * relevant institution, not to one specific person. Adding a
     * requestedBy FK would let this target the actual requester; noted
     * as a possible follow-up, out of scope for this fix.
     */
    private void notifyInstitutionManagers(Institution institution, String type, String title, String message, Integer refId) {
        if (institution == null) return;

        List<User> staff = userRepository.findByInstitution_InstitutionId(institution.getInstitutionId());

        for (User u : staff) {
            String role = u.getRole() != null ? u.getRole().getRoleName() : null;
            if ("LAB_MANAGER".equalsIgnoreCase(role) || "INSTITUTION_ADMIN".equalsIgnoreCase(role)) {
                notificationService.create(u, type, title, message, refId);
            }
        }
    }

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

        ResourceSharingRequest saved = repository.save(request);

        // Notify the equipment-owning (sender) institution's managers —
        // they're the ones who need to act on it.
        notifyInstitutionManagers(
                sender,
                "SHARING_REQUEST_RECEIVED",
                "New resource sharing request",
                receiver.getInstitutionName() + " has requested access to " + equipment.getEquipmentName() + ".",
                saved.getId().intValue()
        );

        return saved;
    }

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
        ResourceSharingRequest saved = repository.save(req);

        // Notify the requesting (receiver) institution's managers of the outcome.
        notifyInstitutionManagers(
                saved.getReceiverInstitution(),
                "SHARING_REQUEST_" + normalizedStatus,
                "Sharing request " + normalizedStatus.toLowerCase(),
                "Your request for " + saved.getEquipment().getEquipmentName()
                        + " was " + normalizedStatus.toLowerCase() + ".",
                saved.getId().intValue()
        );

        return saved;
    }
}