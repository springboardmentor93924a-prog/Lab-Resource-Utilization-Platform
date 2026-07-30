package com.labresource.service.impl;

import com.labresource.dto.resourcesharing.ResourceSharingRequestDto;
import com.labresource.dto.resourcesharing.ResourceSharingResponseDto;
import com.labresource.entity.Equipment;
import com.labresource.entity.Institution;
import com.labresource.entity.ResourceSharingRequest;
import com.labresource.entity.User;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.InstitutionRepository;
import com.labresource.repository.ResourceSharingRequestRepository;
import com.labresource.repository.UserRepository;
import com.labresource.service.ResourceSharingRequestService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceSharingRequestServiceImpl implements ResourceSharingRequestService {

    private final ResourceSharingRequestRepository resourceSharingRequestRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;

    public ResourceSharingRequestServiceImpl(
            ResourceSharingRequestRepository resourceSharingRequestRepository,
            EquipmentRepository equipmentRepository,
            UserRepository userRepository,
            InstitutionRepository institutionRepository
    ) {
        this.resourceSharingRequestRepository = resourceSharingRequestRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.institutionRepository = institutionRepository;
    }

    @Override
    public ResourceSharingResponseDto createRequest(ResourceSharingRequestDto requestDto) {

        Equipment equipment = equipmentRepository.findById(requestDto.getEquipmentId())
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found"));

        User requester = userRepository.findById(requestDto.getRequesterId())
                .orElseThrow(() -> new EntityNotFoundException("Requester not found"));

        Institution requesterInstitution = institutionRepository.findById(requestDto.getRequesterInstitutionId())
                .orElseThrow(() -> new EntityNotFoundException("Requester Institution not found"));

        Institution providerInstitution = institutionRepository.findById(requestDto.getProviderInstitutionId())
                .orElseThrow(() -> new EntityNotFoundException("Provider Institution not found"));

        ResourceSharingRequest request = new ResourceSharingRequest();

        request.setEquipment(equipment);
        request.setRequester(requester);
        request.setRequesterInstitution(requesterInstitution);
        request.setProviderInstitution(providerInstitution);
        request.setStartTime(requestDto.getStartTime());
        request.setEndTime(requestDto.getEndTime());
        request.setPurpose(requestDto.getPurpose());

        ResourceSharingRequest saved = resourceSharingRequestRepository.save(request);

        return mapToResponse(saved);
    }

    @Override
    public List<ResourceSharingResponseDto> getAllRequests() {
        return resourceSharingRequestRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceSharingResponseDto getRequestById(String id) {

        ResourceSharingRequest request = resourceSharingRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Request not found"));

        return mapToResponse(request);
    }

    @Override
    public List<ResourceSharingResponseDto> getRequestsByRequester(String requesterId) {

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new EntityNotFoundException("Requester not found"));

        return resourceSharingRequestRepository.findByRequester(requester)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResourceSharingResponseDto> getRequestsByRequesterInstitution(String institutionId) {

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new EntityNotFoundException("Institution not found"));

        return resourceSharingRequestRepository.findByRequesterInstitution(institution)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResourceSharingResponseDto> getRequestsByProviderInstitution(String institutionId) {

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new EntityNotFoundException("Institution not found"));

        return resourceSharingRequestRepository.findByProviderInstitution(institution)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResourceSharingResponseDto> getRequestsByStatus(String status) {

        return resourceSharingRequestRepository.findByStatusIgnoreCase(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceSharingResponseDto approveRequest(String requestId, String approvedById) {

        ResourceSharingRequest request = resourceSharingRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Request not found"));

        User approver = userRepository.findById(approvedById)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        request.setStatus("APPROVED");
        request.setApprovedBy(approver);
        request.setRejectionReason(null);

        ResourceSharingRequest updated = resourceSharingRequestRepository.save(request);

        return mapToResponse(updated);
    }

    @Override
    public ResourceSharingResponseDto rejectRequest(String requestId,
                                                    String approvedById,
                                                    String rejectionReason) {

        ResourceSharingRequest request = resourceSharingRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Request not found"));

        User approver = userRepository.findById(approvedById)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        request.setStatus("REJECTED");
        request.setApprovedBy(approver);
        request.setRejectionReason(rejectionReason);

        ResourceSharingRequest updated = resourceSharingRequestRepository.save(request);

        return mapToResponse(updated);
    }

    @Override
    public ResourceSharingResponseDto updateRequest(String id,
                                                    ResourceSharingRequestDto requestDto) {

        ResourceSharingRequest request = resourceSharingRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Request not found"));

        Equipment equipment = equipmentRepository.findById(requestDto.getEquipmentId())
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found"));

        request.setEquipment(equipment);
        request.setStartTime(requestDto.getStartTime());
        request.setEndTime(requestDto.getEndTime());
        request.setPurpose(requestDto.getPurpose());

        ResourceSharingRequest updated = resourceSharingRequestRepository.save(request);

        return mapToResponse(updated);
    }

    @Override
    public void deleteRequest(String id) {

        ResourceSharingRequest request = resourceSharingRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Request not found"));

        resourceSharingRequestRepository.delete(request);
    }

    private ResourceSharingResponseDto mapToResponse(ResourceSharingRequest request) {

        ResourceSharingResponseDto response = new ResourceSharingResponseDto();

        response.setId(request.getId());

        if (request.getEquipment() != null) {
            response.setEquipmentId(request.getEquipment().getId());
            response.setEquipmentName(request.getEquipment().getName());
        }

        if (request.getRequester() != null) {
            response.setRequesterId(request.getRequester().getId());
            response.setRequesterName(
                    request.getRequester().getFirstName() + " " +
                            request.getRequester().getLastName()
            );
        }

        if (request.getRequesterInstitution() != null) {
            response.setRequesterInstitutionId(request.getRequesterInstitution().getId());
            response.setRequesterInstitutionName(request.getRequesterInstitution().getName());
        }

        if (request.getProviderInstitution() != null) {
            response.setProviderInstitutionId(request.getProviderInstitution().getId());
            response.setProviderInstitutionName(request.getProviderInstitution().getName());
        }

        response.setStartTime(request.getStartTime());
        response.setEndTime(request.getEndTime());
        response.setPurpose(request.getPurpose());
        response.setStatus(request.getStatus());

        if (request.getApprovedBy() != null) {
            response.setApprovedById(request.getApprovedBy().getId());
            response.setApprovedByName(
                    request.getApprovedBy().getFirstName() + " " +
                            request.getApprovedBy().getLastName()
            );
        }

        response.setRejectionReason(request.getRejectionReason());
        response.setCreatedAt(request.getCreatedAt());
        response.setUpdatedAt(request.getUpdatedAt());

        return response;
    }
}