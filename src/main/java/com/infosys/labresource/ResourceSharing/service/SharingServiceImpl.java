package com.infosys.labresource.ResourceSharing.service;

import com.infosys.labresource.Equipment.Repository.EquipmentRepository;
import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.ResourceSharing.Entity.ResourceSharingRequest;
import com.infosys.labresource.ResourceSharing.Entity.SharingRequestStatus;
import com.infosys.labresource.ResourceSharing.Repository.ResourceSharingRepo;
import com.infosys.labresource.ResourceSharing.dtos.SharingRequestDTO;
import com.infosys.labresource.ResourceSharing.dtos.SharingResponseDTO;
import com.infosys.labresource.user.Repository.UserRepository;
import com.infosys.labresource.user.entites.Role;
import com.infosys.labresource.user.entites.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Service
@RequiredArgsConstructor
public class SharingServiceImpl implements SharingService{
    private final ResourceSharingRepo sharingRepo;
    private final EquipmentRepository equipRepo;
    private final UserRepository userRepo;
    @Override
    public SharingResponseDTO createRequest(SharingRequestDTO requestDTO) {

        Equipment equip = equipRepo.findById(requestDTO.getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found."));

        UserEntity user = userRepo.findById(requestDTO.getRequestedById())
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new RuntimeException("User is inactive.");
        }

        if (equip.getInstitution().getInstitutionId().equals(user.getInstitution().getInstitutionId())) {
            throw new RuntimeException("Equipment belongs to your institution. Resource sharing is not required.");
        }

        ResourceSharingRequest req = new ResourceSharingRequest();

        req.setEquipment(equip);
        req.setRequestedBy(user);
        req.setRequestingInstitution(user.getInstitution());
        req.setStatus(SharingRequestStatus.PENDING);
        req.setRequestedAt(LocalDateTime.now());

        ResourceSharingRequest savedReq = sharingRepo.save(req);

        return convertToDTO(savedReq);
    }

    @Override
    public List<SharingResponseDTO> getAllRequests() {

        List<ResourceSharingRequest> reqList = sharingRepo.findAll();
        List<SharingResponseDTO> resList = new ArrayList<>();

        for (ResourceSharingRequest req : reqList) {
            resList.add(convertToDTO(req));
        }

        return resList;
    }

    @Override
    public SharingResponseDTO getRequestById(Long requestId) {

        ResourceSharingRequest req = sharingRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Sharing request not found."));

        return convertToDTO(req);
    }

    @Override
    public List<SharingResponseDTO> getPendingRequests() {

        List<ResourceSharingRequest> reqList = sharingRepo.findByStatus(SharingRequestStatus.PENDING);
        List<SharingResponseDTO> resList = new ArrayList<>();

        for (ResourceSharingRequest req : reqList) {
            resList.add(convertToDTO(req));
        }

        return resList;
    }

    @Override
    public SharingResponseDTO approveRequest(Long requestId, String approverEmail) {

        ResourceSharingRequest req = sharingRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Sharing request not found."));

        if (req.getStatus() != SharingRequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be approved.");
        }

        UserEntity approver = userRepo.findByEmail(approverEmail)
                .orElseThrow(() -> new RuntimeException("Approver not found."));

        if (approver.getRole() != Role.LAB_MANAGER &&
                approver.getRole() != Role.DEPARTMENT_HEAD &&
                approver.getRole() != Role.INSTITUTION_ADMIN) {

            throw new RuntimeException("You are not authorized to approve this sharing request.");
        }

        if (!approver.getInstitution().getInstitutionId()
                .equals(req.getEquipment().getInstitution().getInstitutionId())) {

            throw new RuntimeException("Approver does not belong to the equipment institution.");
        }

        req.setApprovedBy(approver);
        req.setStatus(SharingRequestStatus.APPROVED);
        req.setActionedAt(LocalDateTime.now());

        ResourceSharingRequest updatedReq = sharingRepo.save(req);

        return convertToDTO(updatedReq);
    }

    @Override
    public SharingResponseDTO rejectRequest(Long requestId) {

        ResourceSharingRequest req = sharingRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Sharing request not found."));

        if (req.getStatus() != SharingRequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be rejected.");
        }

        req.setStatus(SharingRequestStatus.REJECTED);
        req.setActionedAt(LocalDateTime.now());

        ResourceSharingRequest updatedReq = sharingRepo.save(req);

        return convertToDTO(updatedReq);
    }

    private SharingResponseDTO convertToDTO(ResourceSharingRequest req) {

        SharingResponseDTO dto = new SharingResponseDTO();

        dto.setRequestId(req.getRequestId());
        dto.setEquipmentId(req.getEquipment().getEquipId());
        dto.setRequestedById(req.getRequestedBy().getUserId());
        dto.setRequestingInstitutionId(req.getRequestingInstitution().getInstitutionId());
        dto.setEquipmentInstitutionId(req.getEquipment().getInstitution().getInstitutionId());
        dto.setStatus(req.getStatus());
        dto.setRequestedAt(req.getRequestedAt());

        if (req.getApprovedBy() != null) {
            dto.setApprovedById(req.getApprovedBy().getUserId());
        }

        return dto;
    }
}
