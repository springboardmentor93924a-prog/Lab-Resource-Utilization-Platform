package com.infosys.labresource.ResourceSharing.service;

import com.infosys.labresource.ResourceSharing.dtos.SharingRequestDTO;
import com.infosys.labresource.ResourceSharing.dtos.SharingResponseDTO;

import java.util.List;

public interface SharingService {
    SharingResponseDTO createRequest(SharingRequestDTO reqDto, String requesterEmail);

    List<SharingResponseDTO> getAllRequests();

    SharingResponseDTO getRequestById(Long requestId);

    List<SharingResponseDTO> getPendingRequests();

    SharingResponseDTO approveRequest(Long requestId, String approverEmail);

    SharingResponseDTO rejectRequest(Long requestId);
}
