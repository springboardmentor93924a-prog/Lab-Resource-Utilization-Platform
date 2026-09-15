package com.labresource.backend.sharing.controller;

import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.sharing.dto.InstitutionSharingOverviewDto;
import com.labresource.backend.sharing.dto.SharingAgreementDetailDto;
import com.labresource.backend.sharing.dto.SharingMoUProposalDto;
import com.labresource.backend.sharing.entity.ResourceSharingRequest;
import com.labresource.backend.sharing.entity.SharingAgreement;
import com.labresource.backend.sharing.service.SharingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.labresource.backend.department.dto.DepartmentDto;
import com.labresource.backend.department.service.DepartmentService;
import com.labresource.backend.equipment.dto.EquipmentDto;
import com.labresource.backend.equipment.service.EquipmentService;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.laboratory.entity.Laboratory;
import com.labresource.backend.laboratory.repository.LaboratoryRepository;
import com.labresource.backend.common.exception.ApiException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/sharing")
@RequiredArgsConstructor
public class SharingController {

    private final SharingService sharingService;
    private final EquipmentService equipmentService;
    private final DepartmentService departmentService;
    private final LaboratoryRepository laboratoryRepository;
    private final InstitutionRepository institutionRepository;

    @PostMapping("/requests")
    @PreAuthorize("hasAnyAuthority('ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN', 'MANAGE_SHARING_REQUEST')")
    public ResourceSharingRequest submitRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam Long equipmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String purpose) {
        return sharingService.submitRequest(principal, equipmentId, startDate, endDate, purpose);
    }

    /**
     * Owning Department Head counter-proposes MOU terms, hourly price rate, and time window.
     */
    @PostMapping("/requests/{id}/propose-mou")
    @PreAuthorize("hasAnyAuthority('APPROVE_SHARING_REQUEST', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public ResourceSharingRequest proposeMou(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody SharingMoUProposalDto dto) {
        return sharingService.proposeMou(principal, id, dto);
    }

    /**
     * Owning Department Head rejects initial sharing request with mandatory reason.
     */
    @PostMapping("/requests/{id}/reject")
    @PreAuthorize("hasAnyAuthority('APPROVE_SHARING_REQUEST', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public ResourceSharingRequest rejectRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam String rejectionReason) {
        return sharingService.rejectRequest(principal, id, rejectionReason);
    }

    /**
     * Requesting Department Head accepts the proposed MOU terms.
     */
    @PostMapping("/requests/{id}/accept-mou")
    @PreAuthorize("hasAnyAuthority('ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public SharingAgreement acceptMou(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return sharingService.acceptMou(principal, id);
    }

    /**
     * Requesting Lab Manager registers/catalogs the shared equipment into local lab inventory upon MoU acceptance.
     */
    @PostMapping("/agreements/{agreementId}/catalog-equipment")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN', 'MANAGE_EQUIPMENT')")
    public Equipment catalogSharedEquipment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long agreementId,
            @RequestParam Long targetLabId) {
        return sharingService.catalogSharedEquipment(principal, agreementId, targetLabId);
    }

    /**
     * Institution Admin Overview Dashboard (For BOTH Owning & Requesting Institution Admins).
     */
    @GetMapping("/institution-overview")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN', 'MANAGE_INSTITUTION')")
    public InstitutionSharingOverviewDto getInstitutionSharingOverview(@AuthenticationPrincipal UserPrincipal principal) {
        return sharingService.getInstitutionSharingOverview(principal);
    }

    // ── Detailed Query Endpoints for Department Head ──────────────────────────

    @GetMapping("/requests/{id}/details")
    public SharingAgreementDetailDto getRequestDetails(@PathVariable Long id) {
        return sharingService.getRequestDetails(id);
    }

    @GetMapping("/requests/incoming/detailed")
    public List<SharingAgreementDetailDto> getIncomingDetailed(@AuthenticationPrincipal UserPrincipal principal) {
        return sharingService.getDetailedIncomingRequests(principal.getInstitutionId());
    }

    @GetMapping("/requests/outgoing/detailed")
    public List<SharingAgreementDetailDto> getOutgoingDetailed(@AuthenticationPrincipal UserPrincipal principal) {
        return sharingService.getDetailedOutgoingRequests(principal.getInstitutionId());
    }

    @GetMapping("/requests/incoming")
    public List<ResourceSharingRequest> getIncoming(@AuthenticationPrincipal UserPrincipal principal) {
        return sharingService.getIncomingRequests(principal.getInstitutionId());
    }

    @GetMapping("/requests/outgoing")
    public List<ResourceSharingRequest> getOutgoing(@AuthenticationPrincipal UserPrincipal principal) {
        return sharingService.getOutgoingRequests(principal.getInstitutionId());
    }

    @GetMapping("/agreements")
    @PreAuthorize("hasAnyAuthority('ROLE_DEPARTMENT_HEAD', 'ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN', 'ROLE_LAB_MANAGER')")
    public List<SharingAgreement> getAgreements(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long equipmentId) {
        if (equipmentId != null) {
            return sharingService.getAgreementsForEquipment(equipmentId);
        }
        return sharingService.getAgreementsForInstitution(principal.getInstitutionId());
    }

    // ── Partner Resource Discovery Endpoints (Read-Only Cross-Institution) ────

    @GetMapping("/institutions/{partnerInstitutionId}/departments")
    @PreAuthorize("hasAnyAuthority('DEPARTMENT_HEAD', 'ROLE_DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SYSTEM_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public List<DepartmentDto> getPartnerDepartments(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long partnerInstitutionId) {
        validatePartnerInstitutionAccess(principal, partnerInstitutionId);
        return departmentService.getByInstitutionId(partnerInstitutionId);
    }

    @GetMapping("/institutions/{partnerInstitutionId}/laboratories")
    @PreAuthorize("hasAnyAuthority('DEPARTMENT_HEAD', 'ROLE_DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SYSTEM_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public List<Laboratory> getPartnerLaboratories(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long partnerInstitutionId,
            @RequestParam(required = false) Long departmentId) {
        validatePartnerInstitutionAccess(principal, partnerInstitutionId);
        if (departmentId != null) {
            // Security: verify the departmentId actually belongs to partnerInstitutionId.
            // Rejects cross-institution department ID injection (e.g. KCE dept passed for PSG partner).
            try {
                com.labresource.backend.department.entity.Department dept =
                        departmentService.getEntity(departmentId);
                if (!partnerInstitutionId.equals(dept.getInstitutionId())) {
                    // Department exists but belongs to a different institution → empty, no leakage.
                    return List.of();
                }
            } catch (ApiException e) {
                // Department not found → return empty.
                return List.of();
            }
            // Double-enforce at DB level: both institution_id AND department_id must match.
            return laboratoryRepository.findByDepartmentIdAndInstitutionIdAndIsActiveTrue(
                    departmentId, partnerInstitutionId);
        }
        return laboratoryRepository.findByInstitutionIdAndIsActiveTrue(partnerInstitutionId);
    }


    @GetMapping("/institutions/{partnerInstitutionId}/equipment")
    @PreAuthorize("hasAnyAuthority('DEPARTMENT_HEAD', 'ROLE_DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SYSTEM_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public List<EquipmentDto> getPartnerEquipment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long partnerInstitutionId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long labId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search) {
        validatePartnerInstitutionAccess(principal, partnerInstitutionId);
        return equipmentService.searchPartnerEquipment(
                partnerInstitutionId, departmentId, labId, category, location, search);
    }

    @GetMapping("/institutions/{partnerInstitutionId}/categories")
    @PreAuthorize("hasAnyAuthority('DEPARTMENT_HEAD', 'ROLE_DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SYSTEM_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public List<String> getPartnerCategories(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long partnerInstitutionId,
            @RequestParam(required = false) Long departmentId) {
        validatePartnerInstitutionAccess(principal, partnerInstitutionId);
        return equipmentService.getPartnerCategories(partnerInstitutionId, departmentId);
    }

    @GetMapping("/institutions/{partnerInstitutionId}/locations")
    @PreAuthorize("hasAnyAuthority('DEPARTMENT_HEAD', 'ROLE_DEPARTMENT_HEAD', 'INSTITUTION_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'SYSTEM_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public List<String> getPartnerLocations(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long partnerInstitutionId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long labId) {
        validatePartnerInstitutionAccess(principal, partnerInstitutionId);
        return equipmentService.getPartnerLocations(partnerInstitutionId, departmentId, labId);
    }

    private void validatePartnerInstitutionAccess(UserPrincipal principal, Long partnerInstitutionId) {
        if (principal != null && principal.getInstitutionId() != null && principal.getInstitutionId().equals(partnerInstitutionId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot explore own institution via partner sharing discovery.");
        }
        Institution partnerInst = institutionRepository.findById(partnerInstitutionId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Partner institution not found."));
        if (!"APPROVED".equalsIgnoreCase(partnerInst.getApprovalStatus()) || !Boolean.TRUE.equals(partnerInst.getIsActive())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Partner institution is not an active approved partner.");
        }
    }
}
