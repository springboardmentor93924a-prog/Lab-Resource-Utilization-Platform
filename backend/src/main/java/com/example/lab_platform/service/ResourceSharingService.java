package com.example.lab_platform.service;

import com.example.lab_platform.entity.ResourceSharingRequest;
import java.util.List;

public interface ResourceSharingService {
    ResourceSharingRequest createRequest(ResourceSharingRequest request);
    List<ResourceSharingRequest> getAllRequests();
    ResourceSharingRequest updateStatus(Long id, String status);
}