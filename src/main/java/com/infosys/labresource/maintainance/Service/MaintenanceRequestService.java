package com.infosys.labresource.maintainance.Service;

import com.infosys.labresource.maintainance.Entities.MaintenanceRequest;

import java.util.List;

public interface MaintenanceRequestService {

    MaintenanceRequest createRequest(Long equipmentId, String requesterEmail,
                                     String reason, String priority, Integer duration);

    MaintenanceRequest approveRequest(Long requestId);

    MaintenanceRequest rejectRequest(Long requestId);

    MaintenanceRequest getRequest(Long requestId);

    List<MaintenanceRequest> getAllRequests();
}
