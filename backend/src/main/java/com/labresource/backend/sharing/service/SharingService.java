package com.labresource.backend.sharing.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.laboratory.entity.Laboratory;
import com.labresource.backend.laboratory.repository.LaboratoryRepository;
import com.labresource.backend.notification.service.NotificationService;
import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.sharing.dto.InstitutionSharingOverviewDto;
import com.labresource.backend.sharing.dto.SharingAgreementDetailDto;
import com.labresource.backend.sharing.dto.SharingMoUProposalDto;
import com.labresource.backend.sharing.entity.ResourceSharingRequest;
import com.labresource.backend.sharing.entity.SharingAgreement;
import com.labresource.backend.sharing.repository.ResourceSharingRequestRepository;
import com.labresource.backend.sharing.repository.SharedBookingRepository;
import com.labresource.backend.sharing.repository.SharingAgreementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SharingService {

    private final ResourceSharingRequestRepository requestRepository;
    private final SharingAgreementRepository agreementRepository;
    private final SharedBookingRepository sharedBookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final DepartmentRepository departmentRepository;
    private final InstitutionRepository institutionRepository;
    private final AppUserRepository appUserRepository;
    private final NotificationService notificationService;

    /**
     * Step 1: Requesting Department Head (e.g. EEE Dept Head at College A) submits initial sharing request for equipment.
     */
    @Transactional
    public ResourceSharingRequest submitRequest(UserPrincipal user, Long equipmentId,
                                                LocalDate start, LocalDate end, String purpose) {
        Long requestingInstId = user.getInstitutionId();
        Long requestingDeptId = user.getDepartmentId();

        Equipment eq = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));

        if (eq.getInstitutionId().equals(requestingInstId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot request inter-institution sharing for equipment owned by your own institution.");
        }

        if (Boolean.FALSE.equals(eq.getIsActive()) || Equipment.RETIRED.equalsIgnoreCase(eq.getStatus()) || Equipment.OUT_OF_SERVICE.equalsIgnoreCase(eq.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Equipment is inactive, retired, or out of service and cannot be requested for sharing.");
        }

        if (!Boolean.TRUE.equals(eq.getIsShareable())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This equipment is not enabled for inter-institution sharing requests.");
        }

        ResourceSharingRequest request = new ResourceSharingRequest();
        request.setRequestingInstitutionId(requestingInstId);
        request.setRequestingDepartmentId(requestingDeptId);
        request.setOwningInstitutionId(eq.getInstitutionId());
        request.setOwningDepartmentId(eq.getDepartmentId());
        request.setEquipmentId(equipmentId);
        request.setRequestedBy(user.getUserId());
        request.setRequestedStartDate(start);
        request.setRequestedEndDate(end);
        request.setPurpose(purpose);
        request.setStatus("PENDING");
        request.setMouStatus("PENDING");

        ResourceSharingRequest saved = requestRepository.save(request);

        // Notify specifically the Owning Department Head of the corresponding department
        notificationService.notifyDepartmentHeads(
                eq.getDepartmentId(),
                "INTER_INSTITUTION_SHARING_REQUEST",
                "New Sharing Request for " + eq.getName(),
                "A new inter-institution sharing request has been submitted for \"" + eq.getName() + "\"."
        );

        return saved;
    }

    /**
     * Step 2 (Option A): Owning Department Head (e.g. EEE Dept Head at College B) proposes MoU
     * terms & conditions and price per hour.
     */
    @Transactional
    public ResourceSharingRequest proposeMou(UserPrincipal user, Long requestId, SharingMoUProposalDto dto) {
        ResourceSharingRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Sharing request not found."));

        if (!user.getInstitutionId().equals(request.getOwningInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only propose MoU terms for equipment owned by your institution.");
        }

        if (!"PENDING".equals(request.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Sharing request is in status " + request.getStatus() + " and cannot be counter-proposed.");
        }

        if (dto.getProposedHourlyRate() == null || dto.getProposedHourlyRate().compareTo(BigDecimal.ZERO) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Proposed hourly rate must be non-negative.");
        }

        request.setStatus("MOU_PROPOSED");
        request.setMouStatus("MOU_PROPOSED");
        request.setProposedHourlyRate(dto.getProposedHourlyRate());
        request.setMouTerms(dto.getMouTerms());
        request.setAvailableStartTime(dto.getAvailableStartTime());
        request.setAvailableEndTime(dto.getAvailableEndTime());
        if (dto.getAvailableStartDate() != null) request.setRequestedStartDate(dto.getAvailableStartDate());
        if (dto.getAvailableEndDate() != null) request.setRequestedEndDate(dto.getAvailableEndDate());
        request.setReviewedBy(user.getUserId());
        request.setReviewedAt(LocalDateTime.now());

        ResourceSharingRequest saved = requestRepository.save(request);

        // Notify Requesting Department Head
        notificationService.notifyUser(
                request.getRequestedBy(),
                "MOU_TERMS_PROPOSED",
                "MoU Proposed for Equipment Sharing",
                "The owning institution proposed MoU terms (" + dto.getProposedHourlyRate() + " INR/hr) for your sharing request."
        );

        return saved;
    }

    /**
     * Step 2 (Option B): Owning Department Head declines request.
     */
    @Transactional
    public ResourceSharingRequest rejectRequest(UserPrincipal user, Long requestId, String rejectionReason) {
        ResourceSharingRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Sharing request not found."));

        if (!user.getInstitutionId().equals(request.getOwningInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only reject requests for equipment owned by your institution.");
        }

        if (rejectionReason == null || rejectionReason.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rejection reason is required.");
        }

        request.setStatus("REJECTED");
        request.setMouStatus("REJECTED");
        request.setRejectionReason(rejectionReason);
        request.setReviewedBy(user.getUserId());
        request.setReviewedAt(LocalDateTime.now());

        ResourceSharingRequest saved = requestRepository.save(request);

        notificationService.notifyUser(
                request.getRequestedBy(),
                "SHARING_REQUEST_REJECTED",
                "Sharing Request Declined",
                "Your sharing request was declined. Reason: " + rejectionReason
        );

        return saved;
    }

    /**
     * Step 3: Requesting Department Head accepts proposed MoU terms & conditions.
     */
    @Transactional
    public SharingAgreement acceptMou(UserPrincipal user, Long requestId) {
        ResourceSharingRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Sharing request not found."));

        if (!user.getInstitutionId().equals(request.getRequestingInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only accept MoU terms for requests created by your institution.");
        }

        if (!"MOU_PROPOSED".equals(request.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No active MoU proposed for this request (Status: " + request.getStatus() + ").");
        }

        request.setStatus("APPROVED");
        request.setMouStatus("MOU_ACCEPTED");
        request.setMouAcceptedAt(LocalDateTime.now());
        requestRepository.save(request);

        // Create active SharingAgreement
        SharingAgreement agreement = new SharingAgreement();
        agreement.setRequestingInstitutionId(request.getRequestingInstitutionId());
        agreement.setRequestingDepartmentId(request.getRequestingDepartmentId());
        agreement.setOwningInstitutionId(request.getOwningInstitutionId());
        agreement.setOwningDepartmentId(request.getOwningDepartmentId());
        agreement.setEquipmentId(request.getEquipmentId());
        agreement.setStatus("ACTIVE");
        agreement.setCostSharingTerms(request.getMouTerms());
        agreement.setMouTerms(request.getMouTerms());
        agreement.setHourlyRate(request.getProposedHourlyRate());
        agreement.setStartDate(request.getRequestedStartDate());
        agreement.setEndDate(request.getRequestedEndDate());
        agreement.setApprovedBy(request.getReviewedBy());
        agreement.setApprovedAt(request.getReviewedAt());
        agreement.setTermsAcceptedBy(user.getUserId());
        agreement.setTermsAcceptedAt(LocalDateTime.now());

        SharingAgreement savedAgreement = agreementRepository.save(agreement);

        // Notify Requesting Lab Managers to catalog the shared equipment
        if (request.getRequestingDepartmentId() != null) {
            notificationService.notifyDepartmentLabManagers(
                    request.getRequestingDepartmentId(),
                    "MOU_ACCEPTED_CATALOG_READY",
                    "MoU Accepted: Equipment Ready for Cataloging",
                    "MoU terms accepted for shared equipment. You can now catalog it into your laboratory inventory."
            );
        }

        return savedAgreement;
    }

    /**
     * Step 4: Requesting Lab Manager catalogs/registers the shared equipment into local laboratory inventory.
     */
    @Transactional
    public Equipment catalogSharedEquipment(UserPrincipal labManager, Long agreementId, Long targetLabId) {
        SharingAgreement agreement = agreementRepository.findById(agreementId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Sharing agreement not found."));

        if (!labManager.getInstitutionId().equals(agreement.getRequestingInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only catalog shared equipment for your own institution.");
        }

        Laboratory lab = laboratoryRepository.findById(targetLabId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Target Laboratory not found."));

        Equipment sourceEq = equipmentRepository.findById(agreement.getEquipmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Source equipment not found."));

        // Create catalog entry for shared equipment in requesting institution
        Equipment cataloged = new Equipment();
        cataloged.setInstitutionId(labManager.getInstitutionId());
        cataloged.setDepartmentId(lab.getDepartmentId());
        cataloged.setLabId(lab.getLabId());
        cataloged.setName(sourceEq.getName() + " (Shared - " + institutionRepository.findById(agreement.getOwningInstitutionId()).map(Institution::getCode).orElse("External") + ")");
        cataloged.setCategory(sourceEq.getCategory());
        cataloged.setManufacturer(sourceEq.getManufacturer());
        cataloged.setModel(sourceEq.getModel());
        cataloged.setSerialNumber("SHARED-" + sourceEq.getSerialNumber());
        cataloged.setHourlyRate(agreement.getHourlyRate());
        cataloged.setExternalHourlyRate(agreement.getHourlyRate());
        cataloged.setStatus(Equipment.AVAILABLE);
        cataloged.setCondition(sourceEq.getCondition());
        cataloged.setIsShareable(true);
        cataloged.setImageSecureUrl(sourceEq.getImageSecureUrl());
        cataloged.setSpecifications("Shared via MoU Agreement ID #" + agreement.getAgreementId() + ". Terms: " + agreement.getMouTerms());

        Equipment saved = equipmentRepository.save(cataloged);

        agreement.setCatalogedInRequestingLab(true);
        agreementRepository.save(agreement);

        return saved;
    }

    private final com.labresource.backend.billing.repository.CostRecordRepository costRecordRepository;

    /**
     * Institution Admin Overview Dashboard (for BOTH Owning and Requesting Institution Admins).
     */
    @Transactional(readOnly = true)
    public InstitutionSharingOverviewDto getInstitutionSharingOverview(UserPrincipal admin) {
        Long instId = admin.getInstitutionId();
        if (instId == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Institution Admin must belong to an institution.");
        }

        Institution inst = institutionRepository.findById(instId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Institution not found."));

        List<SharingAgreementDetailDto> incoming = getDetailedIncomingRequests(instId);
        List<SharingAgreementDetailDto> outgoing = getDetailedOutgoingRequests(instId);

        long activeCount = incoming.stream().filter(a -> "APPROVED".equals(a.getStatus()) || "ACTIVE".equals(a.getStatus())).count()
                + outgoing.stream().filter(a -> "APPROVED".equals(a.getStatus()) || "ACTIVE".equals(a.getStatus())).count();

        long pendingCount = incoming.stream().filter(a -> "PENDING".equals(a.getStatus()) || "MOU_PROPOSED".equals(a.getStatus())).count()
                + outgoing.stream().filter(a -> "PENDING".equals(a.getStatus()) || "MOU_PROPOSED".equals(a.getStatus())).count();

        // Calculate REALIZED revenue and expense based on actual completed shared usage cost records
        List<com.labresource.backend.billing.entity.CostRecord> allCosts = costRecordRepository.findAll();
        
        // Provider revenue: cost records where institutionId = instId and costType = 'SHARING_FEE'
        BigDecimal revenue = allCosts.stream()
                .filter(c -> instId.equals(c.getInstitutionId()) && "SHARING_FEE".equalsIgnoreCase(c.getCostType()))
                .map(com.labresource.backend.billing.entity.CostRecord::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Requester expense: cost records for agreements where requestingInstitutionId = instId
        List<Long> outgoingAgreementIds = outgoing.stream()
                .map(SharingAgreementDetailDto::getAgreementId)
                .filter(java.util.Objects::nonNull)
                .toList();

        BigDecimal expense = allCosts.stream()
                .filter(c -> "SHARING_FEE".equalsIgnoreCase(c.getCostType()) && c.getSharingAgreementId() != null && outgoingAgreementIds.contains(c.getSharingAgreementId()))
                .map(com.labresource.backend.billing.entity.CostRecord::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        InstitutionSharingOverviewDto overview = new InstitutionSharingOverviewDto();
        overview.setInstitutionId(instId);
        overview.setInstitutionName(inst.getName());
        overview.setTotalActiveMoUs(activeCount);
        overview.setTotalPendingMoUs(pendingCount);
        overview.setTotalRevenueEarned(revenue);
        overview.setTotalExpensePaid(expense);
        overview.setIncomingMoUs(incoming);
        overview.setOutgoingMoUs(outgoing);

        return overview;
    }

    // ── Queries & Booking Verification ───────────────────────────────────────

    public List<SharingAgreement> getActiveAgreements(Long equipmentId, LocalDate date) {
        return agreementRepository.findActiveAgreement(equipmentId, date);
    }

    public List<ResourceSharingRequest> getIncomingRequests(Long institutionId) {
        return requestRepository.findByOwningInstitutionIdOrderByCreatedAtDesc(institutionId);
    }

    public List<ResourceSharingRequest> getOutgoingRequests(Long institutionId) {
        return requestRepository.findByRequestingInstitutionIdOrderByCreatedAtDesc(institutionId);
    }

    public List<SharingAgreement> getAgreementsForEquipment(Long equipmentId) {
        return agreementRepository.findByEquipmentId(equipmentId);
    }

    public List<SharingAgreement> getAgreementsForInstitution(Long institutionId) {
        return agreementRepository.findByInstitutionId(institutionId);
    }

    public SharingAgreementDetailDto getRequestDetails(Long requestId) {
        ResourceSharingRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Sharing request not found."));
        return toDetailDto(request);
    }

    public List<SharingAgreementDetailDto> getDetailedIncomingRequests(Long institutionId) {
        return requestRepository.findByOwningInstitutionIdOrderByCreatedAtDesc(institutionId).stream()
                .map(this::toDetailDto)
                .toList();
    }

    public List<SharingAgreementDetailDto> getDetailedOutgoingRequests(Long institutionId) {
        return requestRepository.findByRequestingInstitutionIdOrderByCreatedAtDesc(institutionId).stream()
                .map(this::toDetailDto)
                .toList();
    }

    // ── Private Helper: Build Detailed DTO ───────────────────────────────────

    private SharingAgreementDetailDto toDetailDto(ResourceSharingRequest req) {
        SharingAgreementDetailDto dto = new SharingAgreementDetailDto();

        dto.setRequestId(req.getRequestId());
        dto.setStatus(req.getStatus());
        dto.setCatalogedInRequestingLab(Boolean.TRUE.equals(req.getCatalogedInRequestingLab()));

        // Find active agreement linked to this request if approved
        List<SharingAgreement> agreements = agreementRepository.findByEquipmentId(req.getEquipmentId());
        agreements.stream()
                .filter(a -> a.getRequestingInstitutionId().equals(req.getRequestingInstitutionId())
                        && a.getOwningInstitutionId().equals(req.getOwningInstitutionId())
                        && a.getStartDate().equals(req.getRequestedStartDate()))
                .findFirst()
                .ifPresent(a -> {
                    dto.setAgreementId(a.getAgreementId());
                    dto.setCatalogedInRequestingLab(Boolean.TRUE.equals(a.getCatalogedInRequestingLab()));
                });

        // Equipment details
        Equipment eq = equipmentRepository.findById(req.getEquipmentId()).orElse(null);
        if (eq != null) {
            dto.setEquipmentId(eq.getEquipmentId());
            dto.setEquipmentName(eq.getName());
            dto.setEquipmentCategory(eq.getCategory());
            dto.setEquipmentSerialNumber(eq.getSerialNumber());
            dto.setEquipmentLocation(eq.getLocation());
            dto.setInternalHourlyRate(eq.getHourlyRate());
            dto.setExternalHourlyRate(eq.getExternalHourlyRate());

            dto.setOwningDepartmentId(eq.getDepartmentId());
            departmentRepository.findById(eq.getDepartmentId())
                    .ifPresent(d -> dto.setOwningDepartmentName(d.getName()));
        }

        if (req.getRequestingDepartmentId() != null) {
            dto.setRequestingDepartmentId(req.getRequestingDepartmentId());
            departmentRepository.findById(req.getRequestingDepartmentId())
                    .ifPresent(d -> dto.setRequestingDepartmentName(d.getName()));
        }

        // Owning & Requesting institution names
        dto.setOwningInstitutionId(req.getOwningInstitutionId());
        institutionRepository.findById(req.getOwningInstitutionId())
                .ifPresent(i -> dto.setOwningInstitutionName(i.getName()));

        dto.setRequestingInstitutionId(req.getRequestingInstitutionId());
        institutionRepository.findById(req.getRequestingInstitutionId())
                .ifPresent(i -> dto.setRequestingInstitutionName(i.getName()));

        // Dates & Purpose
        dto.setRequestedStartDate(req.getRequestedStartDate());
        dto.setRequestedEndDate(req.getRequestedEndDate());
        dto.setPurpose(req.getPurpose());

        // MOU terms
        dto.setProposedHourlyRate(req.getProposedHourlyRate());
        dto.setMouTerms(req.getMouTerms());
        dto.setAvailableStartTime(req.getAvailableStartTime());
        dto.setAvailableEndTime(req.getAvailableEndTime());

        // Rejection reasons
        dto.setRejectionReason(req.getRejectionReason());
        dto.setMouRejectionReason(req.getMouRejectionReason());

        // User names
        dto.setRequestedByUserId(req.getRequestedBy());
        if (req.getRequestedBy() != null) {
            appUserRepository.findById(req.getRequestedBy())
                    .ifPresent(u -> dto.setRequestedByUserName(u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")));
        }

        dto.setReviewedByUserId(req.getReviewedBy());
        if (req.getReviewedBy() != null) {
            appUserRepository.findById(req.getReviewedBy())
                    .ifPresent(u -> dto.setReviewedByUserName(u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")));
        }

        dto.setCreatedAt(req.getCreatedAt());
        dto.setReviewedAt(req.getReviewedAt());

        return dto;
    }
}
