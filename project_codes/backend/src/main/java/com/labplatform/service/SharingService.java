package com.labplatform.service;

import com.labplatform.entity.*;
import com.labplatform.repository.EquipmentRepository;
import com.labplatform.repository.SharingRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SharingService {

    private final SharingRequestRepository sharingRepository;
    private final EquipmentRepository equipmentRepository;
    private final NotificationService notificationService;
    private final CostService costService;

    public SharingRequest request(User requester, Long equipmentId, String justification, BigDecimal proposedFee) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));

        if (!equipment.isSharableAcrossInstitutions()) {
            throw new IllegalStateException("This equipment is not enabled for inter-institution sharing");
        }

        SharingRequest sharingRequest = SharingRequest.builder()
                .equipment(equipment)
                .requestingInstitution(requester.getInstitution())
                .requestedBy(requester)
                .justification(justification)
                .proposedUsageFee(proposedFee)
                .status(SharingRequestStatus.PENDING)
                .build();

        return sharingRepository.save(sharingRequest);
    }

    public SharingRequest review(Long requestId, User reviewer, boolean approve) {
        SharingRequest req = get(requestId);
        req.setStatus(approve ? SharingRequestStatus.APPROVED : SharingRequestStatus.REJECTED);
        req.setReviewedBy(reviewer);
        SharingRequest saved = sharingRepository.save(req);

        notificationService.notify(req.getRequestedBy(),
                "Sharing request " + (approve ? "approved" : "rejected"),
                "Your request to access " + req.getEquipment().getName() + " was " + (approve ? "approved" : "rejected") + ".",
                "SHARING");

        if (approve && req.getProposedUsageFee() != null) {
            costService.recordCharge(null, req.getEquipment(),
                    req.getRequestingInstitution() != null ? req.getRequestingInstitution().getName() : "External",
                    req.getProposedUsageFee(), "SHARING_FEE");
        }
        return saved;
    }

    public SharingRequest get(Long id) {
        return sharingRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Sharing request not found"));
    }

    public List<SharingRequest> forInstitution(Long institutionId) {
        return sharingRepository.findByRequestingInstitutionId(institutionId);
    }

    public List<SharingRequest> forEquipment(Long equipmentId) {
        return sharingRepository.findByEquipmentId(equipmentId);
    }

    public List<SharingRequest> byStatus(SharingRequestStatus status) {
        return sharingRepository.findByStatus(status);
    }

    public List<SharingRequest> all() {
        return sharingRepository.findAll();
    }
}
