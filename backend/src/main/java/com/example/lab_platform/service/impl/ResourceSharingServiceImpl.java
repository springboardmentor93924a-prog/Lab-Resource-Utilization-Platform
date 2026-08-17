package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.Institution;
import com.example.lab_platform.entity.ResourceSharingRequest;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.InstitutionRepository;
import com.example.lab_platform.repository.ResourceSharingRepository;
import com.example.lab_platform.service.ResourceSharingService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceSharingServiceImpl implements ResourceSharingService {

    private final ResourceSharingRepository repository;
    private final InstitutionRepository institutionRepository;
    private final EquipmentRepository equipmentRepository;

    public ResourceSharingServiceImpl(
            ResourceSharingRepository repository,
            InstitutionRepository institutionRepository,
            EquipmentRepository equipmentRepository) {
        this.repository = repository;
        this.institutionRepository = institutionRepository;
        this.equipmentRepository = equipmentRepository;
    }

    @Override
    public ResourceSharingRequest createRequest(ResourceSharingRequest request) {
        if (request.getEquipment() == null || request.getEquipment().getEquipmentId() == null) {
            throw new RuntimeException("Equipment is required");
        }
        if (request.getSenderInstitution() == null || request.getSenderInstitution().getInstitutionId() == null) {
            throw new RuntimeException("Sender institution is required");
        }
        if (request.getReceiverInstitution() == null || request.getReceiverInstitution().getInstitutionId() == null) {
            throw new RuntimeException("Receiver institution is required");
        }

        Integer senderId = request.getSenderInstitution().getInstitutionId();
        Integer receiverId = request.getReceiverInstitution().getInstitutionId();

        if (senderId.equals(receiverId)) {
            throw new RuntimeException("Sender and receiver institutions must be different");
        }

        Institution sender = institutionRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender institution not found"));
        Institution receiver = institutionRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver institution not found"));

        Equipment equipment = equipmentRepository.findById(request.getEquipment().getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        if (equipment.getInstitution() == null
                || !equipment.getInstitution().getInstitutionId().equals(senderId)) {
            throw new RuntimeException(
                    "This equipment does not belong to the selected sender institution"
            );
        }

        request.setEquipment(equipment);
        request.setSenderInstitution(sender);
        request.setReceiverInstitution(receiver);
        request.setStatus("PENDING");

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