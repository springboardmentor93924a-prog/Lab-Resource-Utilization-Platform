 package com.example.lab_platform.service.impl;
 import com.example.lab_platform.service.MaintenanceRequestService;
import com.example.lab_platform.entity.MaintenanceRequest;
import com.example.lab_platform.repository.MaintenanceRequestRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaintenanceRequestServiceImpl
        implements MaintenanceRequestService {

    private final MaintenanceRequestRepository maintenanceRequestRepository;

    public MaintenanceRequestServiceImpl(
            MaintenanceRequestRepository maintenanceRequestRepository) {
        this.maintenanceRequestRepository = maintenanceRequestRepository;
    }

    @Override
    public List<MaintenanceRequest> getAllRequests() {
        return maintenanceRequestRepository.findAll();
    }

    @Override
    public MaintenanceRequest getRequestById(Integer id) {
        return maintenanceRequestRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Maintenance request not found with id: " + id
                        )
                );
    }

    @Override
    public MaintenanceRequest createRequest(
            MaintenanceRequest request) {

        return maintenanceRequestRepository.save(request);
    }

    @Override
    public MaintenanceRequest updateRequest(
            Integer id,
            MaintenanceRequest updatedRequest) {

        MaintenanceRequest existingRequest =
                maintenanceRequestRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Maintenance request not found with id: " + id
                                )
                        );

        existingRequest.setEquipment(updatedRequest.getEquipment());
        existingRequest.setRequestedBy(updatedRequest.getRequestedBy());
        existingRequest.setRequestDate(updatedRequest.getRequestDate());
        existingRequest.setDescription(updatedRequest.getDescription());
        existingRequest.setPriority(updatedRequest.getPriority());
        existingRequest.setRequestStatus(updatedRequest.getRequestStatus());
        existingRequest.setRemarks(updatedRequest.getRemarks());

        return maintenanceRequestRepository.save(existingRequest);
    }
}