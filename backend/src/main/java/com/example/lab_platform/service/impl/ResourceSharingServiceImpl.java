package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.ResourceSharingRequest;
import com.example.lab_platform.repository.ResourceSharingRepository;
import com.example.lab_platform.service.ResourceSharingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceSharingServiceImpl implements ResourceSharingService {

    @Autowired
    private ResourceSharingRepository repository;

    @Override
    public ResourceSharingRequest createRequest(ResourceSharingRequest request) {
        request.setStatus("PENDING");
        if(request.getSenderInstitution() != null) request.setSenderInstitution(request.getSenderInstitution().trim());
        if(request.getReceiverInstitution() != null) request.setReceiverInstitution(request.getReceiverInstitution().trim());
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
        req.setStatus(status.toUpperCase().trim());
        return repository.save(req);
    }
}