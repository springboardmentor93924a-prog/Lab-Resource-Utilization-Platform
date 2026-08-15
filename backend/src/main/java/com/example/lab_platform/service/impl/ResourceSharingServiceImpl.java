package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Institution;
import com.example.lab_platform.entity.ResourceSharingRequest;
import com.example.lab_platform.repository.InstitutionRepository;
import com.example.lab_platform.repository.ResourceSharingRepository;
import com.example.lab_platform.service.ResourceSharingService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceSharingServiceImpl implements ResourceSharingService {

    private final ResourceSharingRepository repository;
    private final InstitutionRepository institutionRepository;

    public ResourceSharingServiceImpl(
            ResourceSharingRepository repository,
            InstitutionRepository institutionRepository) {
        this.repository = repository;
        this.institutionRepository = institutionRepository;
    }

    @Override
    public ResourceSharingRequest createRequest(ResourceSharingRequest request) {
        if (request.getSenderInstitution() == null || request.getSenderInstitution().getInstitutionId() == null) {
            throw new RuntimeException("Sender institution is required");
        }
        if (request.getReceiverInstitution() == null || request.getReceiverInstitution().getInstitutionId() == null) {
            throw new RuntimeException("Receiver institution is required");
        }

        Integer senderId = request.getSenderInstitution().getInstitutionId();
        Integer receiverId = request.getReceiverInstitution().getInstitutionId();

        Institution sender = institutionRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender institution not found"));
        Institution receiver = institutionRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver institution not found"));

        request.setSenderInstitution(sender);
        request.setReceiverInstitution(receiver);
        request.setStatus("PENDING");
        if(request.getSenderInstitution() != null) request.setSenderInstitution(request.getSenderInstitution());
        if(request.getReceiverInstitution() != null) request.setReceiverInstitution(request.getReceiverInstitution());
        return repository.save(request);
    }

    @Override
    public List<ResourceSharingRequest> getAllRequests() {
        return repository.findAll();
    }

    @Override
    public ResourceSharingRequest updateStatus(Long id, String status) {
        ResourceSharingRequest req = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        req.setStatus(status == null ? "PENDING" : status.trim().toUpperCase());
        return repository.save(req);
    }
}