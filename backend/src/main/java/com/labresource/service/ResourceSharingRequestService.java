package com.labresource.service;

import com.labresource.dto.resourcesharing.ResourceSharingRequestDto;
import com.labresource.dto.resourcesharing.ResourceSharingResponseDto;

import java.util.List;

public interface ResourceSharingRequestService {

    ResourceSharingResponseDto createRequest(
            ResourceSharingRequestDto requestDto
    );

    List<ResourceSharingResponseDto> getAllRequests();

    ResourceSharingResponseDto getRequestById(
            String id
    );

    List<ResourceSharingResponseDto> getRequestsByRequester(
            String requesterId
    );

    List<ResourceSharingResponseDto> getRequestsByRequesterInstitution(
            String institutionId
    );

    List<ResourceSharingResponseDto> getRequestsByProviderInstitution(
            String institutionId
    );

    List<ResourceSharingResponseDto> getRequestsByStatus(
            String status
    );

    ResourceSharingResponseDto approveRequest(
            String requestId,
            String approvedById
    );

    ResourceSharingResponseDto rejectRequest(
            String requestId,
            String approvedById,
            String rejectionReason
    );

    ResourceSharingResponseDto updateRequest(
            String id,
            ResourceSharingRequestDto requestDto
    );

    void deleteRequest(
            String id
    );
}