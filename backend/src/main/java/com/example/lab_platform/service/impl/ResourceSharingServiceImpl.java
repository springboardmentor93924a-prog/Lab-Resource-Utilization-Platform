package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Institution;
import com.example.lab_platform.entity.ResourceSharingRequest;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.InstitutionRepository;
import com.example.lab_platform.repository.ResourceSharingRepository;
import com.example.lab_platform.service.ResourceSharingService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class ResourceSharingServiceImpl implements ResourceSharingService {

    private final ResourceSharingRepository repository;
    private final InstitutionRepository institutionRepository;

    public ResourceSharingServiceImpl(ResourceSharingRepository repository,
                                      InstitutionRepository institutionRepository) {
        this.repository = repository;
        this.institutionRepository = institutionRepository;
    }

    private User getLoggedInUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    private Integer getUserInstitutionId(User user) {
        if (user == null || user.getDepartment() == null || user.getDepartment().getInstitution() == null) {
            return null;
        }
        return user.getDepartment().getInstitution().getInstitutionId();
    }

    private boolean isSystemAdmin(String role) {
        return "SYSTEM_ADMIN".equalsIgnoreCase(role);
    }

    @Override
    public ResourceSharingRequest createRequest(ResourceSharingRequest request) {
        User loggedInUser = getLoggedInUser();
        String role = loggedInUser.getRole().getRoleName();

        if (request.getSenderInstitution() == null
                || request.getSenderInstitution().getInstitutionId() == null
                || request.getReceiverInstitution() == null
                || request.getReceiverInstitution().getInstitutionId() == null) {
            throw new RuntimeException("Sender and receiver institutions are required");
        }

        Institution sender = institutionRepository.findById(
                request.getSenderInstitution().getInstitutionId()
        ).orElseThrow(() -> new RuntimeException("Sender institution not found"));

        Institution receiver = institutionRepository.findById(
                request.getReceiverInstitution().getInstitutionId()
        ).orElseThrow(() -> new RuntimeException("Receiver institution not found"));

        if (sender.getInstitutionId().equals(receiver.getInstitutionId())) {
            throw new RuntimeException("Sender and receiver institutions cannot be the same");
        }

        if (!isSystemAdmin(role)) {
            Integer userInstitutionId = getUserInstitutionId(loggedInUser);
            if (userInstitutionId == null || !userInstitutionId.equals(sender.getInstitutionId())) {
                throw new RuntimeException("You can create requests only for your own institution as sender");
            }
        }

        request.setStatus("PENDING");
        request.setSenderInstitution(sender);
        request.setReceiverInstitution(receiver);
        if (request.getEquipmentName() != null) {
            request.setEquipmentName(request.getEquipmentName().trim());
        }
        return repository.save(request);
    }

    @Override
    public List<ResourceSharingRequest> getAllRequests() {
        User loggedInUser = getLoggedInUser();
        String role = loggedInUser.getRole().getRoleName();

        if (isSystemAdmin(role)) {
            return repository.findAll();
        }

        Integer institutionId = getUserInstitutionId(loggedInUser);
        if (institutionId == null) {
            return List.of();
        }

        return repository.findBySenderInstitution_InstitutionIdOrReceiverInstitution_InstitutionId(
                institutionId,
                institutionId
        );
    }

    @Override
    public ResourceSharingRequest updateStatus(Long id, String status) {
        User loggedInUser = getLoggedInUser();
        String role = loggedInUser.getRole().getRoleName();

        ResourceSharingRequest req = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!isSystemAdmin(role)) {
            Integer institutionId = getUserInstitutionId(loggedInUser);
            boolean visibleToUser = institutionId != null
                    && (req.getSenderInstitution() != null
                    && institutionId.equals(req.getSenderInstitution().getInstitutionId())
                    || req.getReceiverInstitution() != null
                    && institutionId.equals(req.getReceiverInstitution().getInstitutionId()));
            if (!visibleToUser) {
                throw new RuntimeException("You are not allowed to update this request");
            }
        }

        String normalizedStatus = status == null ? "" : status.toUpperCase().trim();
        if (!Set.of("PENDING", "APPROVED", "REJECTED").contains(normalizedStatus)) {
            throw new RuntimeException("Invalid status");
        }

        req.setStatus(normalizedStatus);
        return repository.save(req);
    }
}