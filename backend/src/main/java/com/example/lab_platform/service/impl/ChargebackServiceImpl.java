package com.example.lab_platform.service.impl;

import com.example.lab_platform.dto.ChargebackDTO;
import com.example.lab_platform.entity.ChargebackRequest;
import com.example.lab_platform.entity.DepartmentCostAllocation;
import com.example.lab_platform.entity.EquipmentUsageCost;
import com.example.lab_platform.entity.ResourceSharingRequest;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.ChargebackRequestRepository;
import com.example.lab_platform.repository.DepartmentCostAllocationRepository;
import com.example.lab_platform.repository.EquipmentUsageCostRepository;
import com.example.lab_platform.repository.ResourceSharingRepository;
import com.example.lab_platform.service.ChargebackService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChargebackServiceImpl implements ChargebackService {

    private final ChargebackRequestRepository chargebackRepository;
    private final DepartmentCostAllocationRepository allocationRepository;
    private final EquipmentUsageCostRepository usageCostRepository;
    private final ResourceSharingRepository sharingRepository;

    public ChargebackServiceImpl(
            ChargebackRequestRepository chargebackRepository,
            DepartmentCostAllocationRepository allocationRepository,
            EquipmentUsageCostRepository usageCostRepository,
            ResourceSharingRepository sharingRepository) {

        this.chargebackRepository = chargebackRepository;
        this.allocationRepository = allocationRepository;
        this.usageCostRepository = usageCostRepository;
        this.sharingRepository = sharingRepository;
    }

    private Integer scopedInstitutionIdOrNull() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return null;
        }

        User loggedInUser = (User) authentication.getPrincipal();
        String role = loggedInUser.getRole() != null
                ? loggedInUser.getRole().getRoleName()
                : null;

        if ("SYSTEM_ADMIN".equalsIgnoreCase(role)) {
            return null;
        }

        return loggedInUser.getInstitution() != null
                ? loggedInUser.getInstitution().getInstitutionId()
                : -1;
    }

    // =========================================================
    // Generation
    // =========================================================
    @Override
    public int generateChargebacks() {

        int created = 0;
        created += generateDepartmentChargebacks();
        created += generateInstitutionChargebacks();
        return created;
    }

    // Department-to-department: any usage that stayed within its own
    // institution gets recovered from the requesting department via
    // its existing cost allocation record.
    private int generateDepartmentChargebacks() {

        int created = 0;

        for (DepartmentCostAllocation allocation : allocationRepository.findAll()) {

            EquipmentUsageCost usageCost = allocation.getUsageCost();

            if (usageCost == null || usageCost.getUsageCostId() == null) {
                continue;
            }

            if (chargebackRepository.existsByUsageCost_UsageCostId(usageCost.getUsageCostId())) {
                continue;
            }

            // Cross-institution usage is handled by generateInstitutionChargebacks
            // instead, to avoid charging the same usage twice.
            if (isCrossInstitutionUsage(usageCost)) {
                continue;
            }

            if (allocation.getDepartment() == null) {
                continue;
            }

            ChargebackRequest chargeback = new ChargebackRequest();
            chargeback.setScopeType("DEPARTMENT");
            chargeback.setUsageCost(usageCost);
            chargeback.setPayerDepartment(allocation.getDepartment());
            chargeback.setAmount(
                    allocation.getAllocatedAmount() != null ? allocation.getAllocatedAmount() : 0.0);
            chargeback.setStatus("REQUESTED");
            chargeback.setRequestedDate(LocalDate.now());
            chargeback.setRemarks(
                    "Auto-generated from department cost allocation #" + allocation.getAllocationId());

            chargebackRepository.save(chargeback);
            created++;
        }

        return created;
    }

    // Institution-to-institution: usage of a shared piece of equipment
    // by someone from the borrowing institution gets recovered from
    // that institution instead of a department.
    private int generateInstitutionChargebacks() {

        int created = 0;

        List<ResourceSharingRequest> approvedSharing = sharingRepository.findAll().stream()
                .filter(r -> "APPROVED".equalsIgnoreCase(r.getStatus()))
                .collect(Collectors.toList());

        for (ResourceSharingRequest sharing : approvedSharing) {

            if (sharing.getEquipment() == null || sharing.getReceiverInstitution() == null) {
                continue;
            }

            Integer equipmentId = sharing.getEquipment().getEquipmentId();
            Integer receiverInstitutionId = sharing.getReceiverInstitution().getInstitutionId();

            List<EquipmentUsageCost> relevantCosts =
                    usageCostRepository.findByEquipment_EquipmentId(equipmentId).stream()
                            .filter(c -> c.getUsageCostId() != null
                                    && !chargebackRepository.existsByUsageCost_UsageCostId(c.getUsageCostId()))
                            .filter(c -> c.getUser() != null
                                    && c.getUser().getInstitution() != null
                                    && receiverInstitutionId.equals(
                                            c.getUser().getInstitution().getInstitutionId()))
                            .collect(Collectors.toList());

            for (EquipmentUsageCost usageCost : relevantCosts) {

                ChargebackRequest chargeback = new ChargebackRequest();
                chargeback.setScopeType("INSTITUTION");
                chargeback.setUsageCost(usageCost);
                chargeback.setSharingRequest(sharing);
                chargeback.setPayerInstitution(sharing.getReceiverInstitution());
                chargeback.setAmount(usageCost.getTotalCost() != null ? usageCost.getTotalCost() : 0.0);
                chargeback.setStatus("REQUESTED");
                chargeback.setRequestedDate(LocalDate.now());
                chargeback.setRemarks(
                        "Auto-generated from resource sharing agreement #" + sharing.getId()
                                + " on " + sharing.getEquipment().getEquipmentName());

                chargebackRepository.save(chargeback);
                created++;
            }
        }

        return created;
    }

    private boolean isCrossInstitutionUsage(EquipmentUsageCost usageCost) {

        if (usageCost.getUser() == null || usageCost.getUser().getInstitution() == null
                || usageCost.getEquipment() == null || usageCost.getEquipment().getInstitution() == null) {
            return false;
        }

        return !usageCost.getUser().getInstitution().getInstitutionId()
                .equals(usageCost.getEquipment().getInstitution().getInstitutionId());
    }

    // =========================================================
    // Reads / writes
    // =========================================================
    @Override
    public List<ChargebackDTO> getAllChargebacks() {

        generateChargebacks();

        Integer scopedInstitutionId = scopedInstitutionIdOrNull();

        return chargebackRepository.findAll().stream()
                .filter(c -> inScope(c, scopedInstitutionId))
                .map(this::toDTO)
                .sorted(Comparator.comparing(ChargebackDTO::getRequestedDate,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    private boolean inScope(ChargebackRequest chargeback, Integer scopedInstitutionId) {

        if (scopedInstitutionId == null) {
            return true;
        }

        if (chargeback.getUsageCost() != null
                && chargeback.getUsageCost().getEquipment() != null
                && chargeback.getUsageCost().getEquipment().getInstitution() != null) {
            return scopedInstitutionId.equals(
                    chargeback.getUsageCost().getEquipment().getInstitution().getInstitutionId());
        }

        return true;
    }

    @Override
    public ChargebackDTO approve(Integer chargebackId) {
        ChargebackRequest chargeback = getOrThrow(chargebackId);
        requireStatus(chargeback, "REQUESTED");
        chargeback.setStatus("APPROVED");
        return toDTO(chargebackRepository.save(chargeback));
    }

    @Override
    public ChargebackDTO dispute(Integer chargebackId, String remarks) {
        ChargebackRequest chargeback = getOrThrow(chargebackId);
        chargeback.setStatus("DISPUTED");
        if (remarks != null && !remarks.isBlank()) {
            chargeback.setRemarks(remarks);
        }
        return toDTO(chargebackRepository.save(chargeback));
    }

    @Override
    public ChargebackDTO settle(Integer chargebackId) {
        ChargebackRequest chargeback = getOrThrow(chargebackId);
        requireStatus(chargeback, "APPROVED");
        chargeback.setStatus("SETTLED");
        chargeback.setSettledDate(LocalDate.now());
        return toDTO(chargebackRepository.save(chargeback));
    }

    private ChargebackRequest getOrThrow(Integer chargebackId) {
        return chargebackRepository.findById(chargebackId)
                .orElseThrow(() -> new RuntimeException("Chargeback request not found."));
    }

    private void requireStatus(ChargebackRequest chargeback, String expected) {
        if (!expected.equalsIgnoreCase(chargeback.getStatus())) {
            throw new RuntimeException(
                    "Chargeback must be " + expected + " for this action (currently "
                            + chargeback.getStatus() + ").");
        }
    }

    private ChargebackDTO toDTO(ChargebackRequest c) {

        ChargebackDTO dto = new ChargebackDTO();
        dto.setChargebackId(c.getChargebackId());
        dto.setScopeType(c.getScopeType());
        dto.setAmount(c.getAmount());
        dto.setStatus(c.getStatus());
        dto.setRequestedDate(c.getRequestedDate());
        dto.setSettledDate(c.getSettledDate());
        dto.setRemarks(c.getRemarks());

        if ("DEPARTMENT".equalsIgnoreCase(c.getScopeType()) && c.getPayerDepartment() != null) {
            dto.setPayerLabel(c.getPayerDepartment().getDepartmentName());
        } else if (c.getPayerInstitution() != null) {
            dto.setPayerLabel(c.getPayerInstitution().getInstitutionName());
        } else {
            dto.setPayerLabel("Unknown");
        }

        if (c.getUsageCost() != null && c.getUsageCost().getEquipment() != null) {
            dto.setSourceLabel(c.getUsageCost().getEquipment().getEquipmentName());
        } else {
            dto.setSourceLabel("-");
        }

        return dto;
    }
}