 package com.example.lab_platform.service;

import com.example.lab_platform.entity.MaintenanceRequest;

import java.util.List;

public interface MaintenanceRequestService {

    List<MaintenanceRequest> getAllRequests();

    MaintenanceRequest getRequestById(Integer id);

    MaintenanceRequest createRequest(MaintenanceRequest request);

    MaintenanceRequest updateRequest(
            Integer id,
            MaintenanceRequest request
    );
}