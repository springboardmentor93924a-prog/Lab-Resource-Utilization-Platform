package com.labresource.backend.maintenance.service;

import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.equipment.service.EquipmentService;
import com.labresource.backend.issuereport.entity.EquipmentIssueReport;
import com.labresource.backend.issuereport.repository.EquipmentIssueReportRepository;
import com.labresource.backend.maintenance.dto.MaintenanceReportDto;
import com.labresource.backend.maintenance.dto.MaintenanceRequestSummaryDto;
import com.labresource.backend.maintenance.dto.TechnicianWorkloadDto;
import com.labresource.backend.maintenance.entity.MaintenanceAssignment;
import com.labresource.backend.maintenance.entity.MaintenanceLog;
import com.labresource.backend.maintenance.entity.MaintenanceRequest;
import com.labresource.backend.maintenance.entity.TechnicianUnavailability;
import com.labresource.backend.maintenance.repository.MaintenanceAssignmentRepository;
import com.labresource.backend.maintenance.repository.MaintenanceLogRepository;
import com.labresource.backend.maintenance.repository.MaintenanceRequestRepository;
import com.labresource.backend.maintenance.repository.TechnicianUnavailabilityRepository;
import com.labresource.backend.notification.service.NotificationService;
import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.role.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;


import org.springframework.messaging.simp.SimpMessagingTemplate;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final EquipmentRepository equipmentRepository;
    private final EquipmentService equipmentService;
    private final NotificationService notificationService;
    private final AppUserRepository appUserRepository;
    private final TechnicianUnavailabilityRepository unavailabilityRepository;
    private final MaintenanceAssignmentRepository assignmentRepository;
    private final MaintenanceLogRepository logRepository;
    private final EquipmentIssueReportRepository issueReportRepository;
    private final com.labresource.backend.maintenance.repository.MaintenanceRecordRepository maintenanceRecordRepository;
    private final com.labresource.backend.billing.repository.CostRecordRepository costRecordRepository;
    private final com.labresource.backend.budget.repository.BudgetRepository budgetRepository;
    private final com.labresource.backend.laboratory.repository.LaboratoryRepository laboratoryRepository;
    private final com.labresource.backend.department.repository.DepartmentRepository departmentRepository;
    private final com.labresource.backend.storage.StorageService storageService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public MaintenanceRequestSummaryDto report(Long userId, MaintenanceReportDto request) {
        Equipment equipment = equipmentService.getEntity(request.getEquipmentId());

        MaintenanceRequest maintenanceRequest = new MaintenanceRequest();
        maintenanceRequest.setEquipmentId(equipment.getEquipmentId());
        maintenanceRequest.setRequestedBy(userId);
        maintenanceRequest.setDepartmentId(equipment.getDepartmentId());
        maintenanceRequest.setIssueType(request.getIssueType());
        maintenanceRequest.setIssueDescription(request.getIssueDescription());
        maintenanceRequest.setPriority(request.getPriority() == null || request.getPriority().isBlank()
                ? "MEDIUM" : request.getPriority().toUpperCase());
        maintenanceRequest.setAttachmentSecureUrl(request.getAttachmentUrl());
        maintenanceRequest.setStatus(MaintenanceRequest.OPEN);

        MaintenanceRequest saved = maintenanceRequestRepository.save(maintenanceRequest);
        saved.setMaintenanceCode(String.format("MR-%d-%05d", Year.now().getValue(), saved.getMaintenanceId()));
        saved = maintenanceRequestRepository.save(saved);

        notificationService.notifyDepartmentLabManagers(
                equipment.getDepartmentId(),
                "MAINTENANCE_REQUEST_CREATED",
                "Work Order Created",
                "A new work order (" + saved.getMaintenanceCode() + ") has been logged for \"" + equipment.getName() + "\"."
        );

        return MaintenanceRequestSummaryDto.fromEntity(saved, equipment.getName());
    }

    @Transactional
    public MaintenanceRequestSummaryDto createWorkOrderFromIssue(Long userId, Long issueReportId, String priority, LocalDateTime start, LocalDateTime end, Long technicianId) {
        EquipmentIssueReport issueReport = issueReportRepository.findById(issueReportId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Issue report not found."));

        if (issueReport.getMaintenanceId() != null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Work order already exists for this issue report.");
        }

        Equipment equipment = equipmentRepository.findById(issueReport.getEquipmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));

        MaintenanceRequest mr = new MaintenanceRequest();
        mr.setEquipmentId(equipment.getEquipmentId());
        mr.setRequestedBy(issueReport.getReportedBy());
        mr.setDepartmentId(equipment.getDepartmentId());
        mr.setIssueReportId(issueReportId);
        mr.setIssueType(issueReport.getIssueType());
        mr.setIssueDescription(issueReport.getIssueDescription());
        mr.setPriority(priority == null || priority.isBlank() ? issueReport.getPriority() : priority.toUpperCase());
        mr.setAttachmentSecureUrl(issueReport.getAttachmentSecureUrl());
        mr.setAttachmentFileName(issueReport.getAttachmentFileName());
        mr.setAttachmentContentType(issueReport.getAttachmentContentType());
        mr.setStatus(MaintenanceRequest.OPEN);

        if (start != null && end != null) {
            if (!end.isAfter(start)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "End datetime must be after start datetime.");
            }
            mr.setScheduledStartDatetime(start);
            mr.setScheduledEndDatetime(end);
            mr.setScheduledDate(start.toLocalDate());
        }

        // Save to generate ID
        MaintenanceRequest saved = maintenanceRequestRepository.save(mr);
        saved.setMaintenanceCode(String.format("MR-%d-%05d", Year.now().getValue(), saved.getMaintenanceId()));
        saved = maintenanceRequestRepository.save(saved);

        // Link in Issue Report
        issueReport.setMaintenanceId(saved.getMaintenanceId());
        issueReportRepository.save(issueReport);

        if (technicianId != null) {
            assignTechnicianInternal(userId, saved, technicianId, start, end, null, null);
        }

        notificationService.notifyDepartmentLabManagers(
                equipment.getDepartmentId(),
                "MAINTENANCE_REQUEST_CREATED",
                "Work Order Created from Issue",
                "Work order (" + saved.getMaintenanceCode() + ") has been created from issue report ID: " + issueReportId
        );

        return MaintenanceRequestSummaryDto.fromEntity(saved, equipment.getName());
    }

    @Transactional
    public MaintenanceRequestSummaryDto assignTechnician(Long userId, Long maintenanceId, Long technicianId, LocalDateTime start, LocalDateTime end, String problemDescription, String instructions) {
        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        assignTechnicianInternal(userId, mr, technicianId, start, end, problemDescription, instructions);
        MaintenanceRequest saved = maintenanceRequestRepository.save(mr);

        MaintenanceRequestSummaryDto dto = toSummaryDto(saved);
        try {
            messagingTemplate.convertAndSend("/topic/maintenance-updates", dto);
        } catch (Exception e) {
            // Log WS broadcast error silently
        }
        return dto;
    }

    public MaintenanceRequestSummaryDto assignTechnician(Long userId, Long maintenanceId, Long technicianId, LocalDateTime start, LocalDateTime end, String instructions) {
        return assignTechnician(userId, maintenanceId, technicianId, start, end, null, instructions);
    }

    public MaintenanceRequestSummaryDto assignTechnician(Long userId, Long maintenanceId, Long technicianId, LocalDateTime start, LocalDateTime end) {
        return assignTechnician(userId, maintenanceId, technicianId, start, end, null, null);
    }

    private void assignTechnicianInternal(Long assignerId, MaintenanceRequest mr, Long technicianId, LocalDateTime start, LocalDateTime end, String problemDescription, String instructions) {
        Equipment equipment = equipmentRepository.findById(mr.getEquipmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));

        AppUser assigner = appUserRepository.findById(assignerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Assigner not found."));

        // Validate assigner scope
        if (!assigner.getInstitutionId().equals(equipment.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Assigner does not belong to the institution of this equipment.");
        }
        boolean isSystemOrInstAdmin = assigner.getRoles().stream()
                .anyMatch(r -> Role.SYSTEM_ADMIN.equals(r.getRoleName()) || Role.INSTITUTION_ADMIN.equals(r.getRoleName()));
        if (assigner.getDepartmentId() != null && !assigner.getDepartmentId().equals(equipment.getDepartmentId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "User does not have authority over this department's equipment.");
        }

        if (technicianId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Technician is required.");
        }

        AppUser tech = appUserRepository.findById(technicianId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Technician not found."));

        if (tech.getIsActive() == null || !tech.getIsActive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Selected technician account is inactive.");
        }

        boolean isTechRole = tech.getRoles().stream()
                .anyMatch(r -> Role.LAB_TECHNICIAN.equals(r.getRoleName()));
        if (!isTechRole) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Selected user is not a Lab Technician.");
        }

        // Validate institution scope
        if (!equipment.getInstitutionId().equals(tech.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Technician does not belong to the institution of this equipment.");
        }

        // Validate department scope against equipment and assigner
        if (equipment.getDepartmentId() != null && !equipment.getDepartmentId().equals(tech.getDepartmentId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Technician does not belong to the department of this equipment.");
        }
        if (!isSystemOrInstAdmin && assigner.getDepartmentId() != null && !assigner.getDepartmentId().equals(tech.getDepartmentId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Technician does not belong to the manager's authorized department.");
        }

        if (problemDescription == null || problemDescription.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Problem / repair description is required.");
        }
        if (start == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Target start date/time is required.");
        }
        if (end == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Target completion date/time is required.");
        }
        if (!end.isAfter(start)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Target completion date/time must be after target start date/time.");
        }

        mr.setManagerTargetStartDatetime(start);
        mr.setManagerTargetEndDatetime(end);
        mr.setScheduledStartDatetime(start);
        mr.setScheduledEndDatetime(end);
        mr.setScheduledDate(start.toLocalDate());
        mr.setAssignedTechnicianId(technicianId);
        mr.setStatus(MaintenanceRequest.ASSIGNED);

        // Check exact overlap
        List<TechnicianUnavailability> overlaps = unavailabilityRepository.findOverlappingActive(technicianId, start, end);
        if (!overlaps.isEmpty()) {
            throw new ApiException(HttpStatus.CONFLICT, "Technician is unavailable during the scheduled time window.");
        }

        if (instructions != null && !instructions.isBlank()) {
            mr.setManagerInstructions(instructions.trim());
        }

        // Handle re-assignment/rework or new assignment
        if (mr.getAssignedTechnicianId() != null || MaintenanceRequest.REJECTED.equals(mr.getStatus())) {
            List<MaintenanceAssignment> activeAssignments = assignmentRepository.findByMaintenanceIdAndStatus(mr.getMaintenanceId(), "ASSIGNED");
            for (MaintenanceAssignment ma : activeAssignments) {
                ma.setStatus(MaintenanceRequest.REJECTED.equals(mr.getStatus()) ? "REJECTED" : "REASSIGNED");
                ma.setCompletedAt(LocalDateTime.now());
                assignmentRepository.save(ma);
            }
        }

        MaintenanceAssignment newAssignment = new MaintenanceAssignment();
        newAssignment.setMaintenanceId(mr.getMaintenanceId());
        newAssignment.setTechnicianId(technicianId);
        newAssignment.setAssignedBy(assignerId);
        newAssignment.setStatus("ASSIGNED");
        newAssignment.setProblemDescription(problemDescription.trim());
        newAssignment.setTargetStartDatetime(start);
        newAssignment.setTargetCompletionDatetime(end);
        assignmentRepository.save(newAssignment);

        mr.setAssignedTechnicianId(technicianId);
        mr.setStatus(MaintenanceRequest.ASSIGNED);

        // Update issue report if linked
        if (mr.getIssueReportId() != null) {
            issueReportRepository.findById(mr.getIssueReportId()).ifPresent(ir -> {
                ir.setStatus("ASSIGNED");
                ir.setAssignedTechnicianId(technicianId);
                issueReportRepository.save(ir);
            });
        }

        notificationService.notifyUser(
                technicianId,
                "MAINTENANCE_ASSIGNED",
                "New Work Order Assigned",
                "You have been assigned to work order " + mr.getMaintenanceCode()
        );
    }

    @Transactional
    public MaintenanceRequestSummaryDto startWork(Long userId, Long maintenanceId) {
        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        if (MaintenanceRequest.COMPLETED.equals(mr.getStatus()) || MaintenanceRequest.CANCELLED.equals(mr.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot start work on completed or cancelled work orders.");
        }

        if (!userId.equals(mr.getAssignedTechnicianId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the assigned technician can start maintenance on this work order.");
        }

        // Strict state-gate check: Only ACCEPTED, FINALIZED (or existing IN_PROGRESS) work orders can start
        if (!MaintenanceRequest.FINALIZED.equals(mr.getStatus()) &&
            !MaintenanceRequest.ACCEPTED.equals(mr.getStatus()) &&
            !MaintenanceRequest.IN_PROGRESS.equals(mr.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "Maintenance work cannot begin until the repair schedule has been accepted or approved.");
        }

        mr.setStatus(MaintenanceRequest.IN_PROGRESS);
        if (mr.getDowntimeStartedAt() == null) {
            mr.setDowntimeStartedAt(LocalDateTime.now());
        }
        maintenanceRequestRepository.save(mr);

        equipmentRepository.findById(mr.getEquipmentId()).ifPresent(eq -> {
            eq.setStatus(Equipment.UNDER_MAINTENANCE);
            equipmentRepository.save(eq);
        });

        // Update assignment
        assignmentRepository.findByMaintenanceId(maintenanceId).stream()
                .filter(a -> a.getTechnicianId().equals(userId) && !"REMOVED".equals(a.getStatus()) && !"CANCELLED".equals(a.getStatus()))
                .findFirst()
                .ifPresent(a -> {
                    a.setStatus("IN_PROGRESS");
                    if (a.getStartedAt() == null) {
                        a.setStartedAt(LocalDateTime.now());
                    }
                    assignmentRepository.save(a);
                });

        Equipment eq = equipmentRepository.findById(mr.getEquipmentId()).orElse(null);
        String eqName = eq != null ? eq.getName() : "Unknown Equipment";

        MaintenanceRequestSummaryDto dto = toSummaryDto(mr);
        try {
            messagingTemplate.convertAndSend("/topic/maintenance-updates", dto);
        } catch (Exception e) {}
        return dto;
    }

    @Transactional
    public MaintenanceRequestSummaryDto completeWork(Long userId, Long maintenanceId, com.labresource.backend.maintenance.dto.TechnicianCompletionDto dto, org.springframework.web.multipart.MultipartFile completionPhoto) {
        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        if (!userId.equals(mr.getAssignedTechnicianId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the assigned technician can complete this work order.");
        }

        if (!MaintenanceRequest.IN_PROGRESS.equals(mr.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Work order must be IN_PROGRESS to complete work.");
        }

        // Upload completion photo if provided
        if (completionPhoto != null && !completionPhoto.isEmpty()) {
            try {
                com.labresource.backend.storage.CloudinaryUploadResult result = storageService.upload(completionPhoto, "maintenance_completions");
                mr.setCompletionAttachmentPublicId(result.getPublicId());
                mr.setCompletionAttachmentSecureUrl(result.getSecureUrl());
                mr.setCompletionAttachmentFileName(result.getFileName());
            } catch (Exception e) {
                throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload maintenance completion photo: " + e.getMessage());
            }
        }

        String diagNotes = dto != null && dto.getDiagnosticNotes() != null ? dto.getDiagnosticNotes().trim() : null;
        String workPerf = dto != null && dto.getWorkPerformed() != null ? dto.getWorkPerformed().trim() : null;
        String partsUsed = dto != null && dto.getPartsUsed() != null ? dto.getPartsUsed().trim() : null;

        mr.setDiagnosticNotes(diagNotes);
        mr.setWorkPerformed(workPerf);
        mr.setPartsUsed(partsUsed);

        LocalDateTime completedTime = LocalDateTime.now();
        mr.setStatus(MaintenanceRequest.PENDING_VERIFICATION);
        mr.setCompletedAt(completedTime);
        mr.setCompletedDate(completedTime.toLocalDate());

        if (mr.getDowntimeStartedAt() != null) {
            long minutes = Duration.between(mr.getDowntimeStartedAt(), completedTime).toMinutes();
            mr.setDowntimeHours(BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP));
        }

        maintenanceRequestRepository.save(mr);

        // Update assignment
        assignmentRepository.findAll().stream()
                .filter(a -> a.getMaintenanceId().equals(maintenanceId) && a.getTechnicianId().equals(userId) && "IN_PROGRESS".equals(a.getStatus()))
                .findFirst()
                .ifPresent(a -> {
                    a.setStatus("COMPLETED");
                    a.setCompletedAt(completedTime);
                    a.setNotes(workPerf != null && !workPerf.isBlank() ? workPerf : diagNotes);
                    assignmentRepository.save(a);
                });

        // Save a maintenance log with real workPerformed and partsUsed
        MaintenanceLog log = new MaintenanceLog();
        log.setMaintenanceId(mr.getMaintenanceId());
        log.setTechnicianId(userId);
        log.setActionTaken(workPerf != null && !workPerf.isBlank() ? workPerf : (diagNotes != null && !diagNotes.isBlank() ? diagNotes : "Technician submitted work for verification."));
        log.setPartsUsed(partsUsed);
        log.setCost(BigDecimal.ZERO);
        logRepository.save(log);

        // Notify Lab Managers
        notificationService.notifyDepartmentLabManagers(
                mr.getDepartmentId(),
                "MAINTENANCE_COMPLETED_PENDING_VERIFICATION",
                "Maintenance Pending Verification",
                "Work order " + mr.getMaintenanceCode() + " is pending manager verification."
        );

        Equipment eq = equipmentRepository.findById(mr.getEquipmentId()).orElse(null);
        String eqName = eq != null ? eq.getName() : "Unknown Equipment";

        MaintenanceRequestSummaryDto summaryDto = toSummaryDto(mr);
        try {
            messagingTemplate.convertAndSend("/topic/maintenance-updates", summaryDto);
        } catch (Exception e) {}
        return summaryDto;
    }

    @Transactional
    public MaintenanceRequestSummaryDto completeWork(Long userId, Long maintenanceId, String notes) {
        com.labresource.backend.maintenance.dto.TechnicianCompletionDto dto = new com.labresource.backend.maintenance.dto.TechnicianCompletionDto();
        dto.setWorkPerformed(notes);
        return completeWork(userId, maintenanceId, dto, null);
    }

    @Transactional
    public MaintenanceRequestSummaryDto verifyWork(Long userId, Long maintenanceId, com.labresource.backend.maintenance.dto.ManagerVerifyRequestDto dto) {
        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        AppUser manager = appUserRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Manager user not found."));

        Equipment equipment = equipmentRepository.findById(mr.getEquipmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));

        if (!manager.getInstitutionId().equals(equipment.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Manager does not belong to the institution of this equipment.");
        }
        boolean isSystemOrInstAdmin = manager.getRoles().stream()
                .anyMatch(r -> Role.SYSTEM_ADMIN.equals(r.getRoleName()) || Role.INSTITUTION_ADMIN.equals(r.getRoleName()));
        if (manager.getDepartmentId() != null && !manager.getDepartmentId().equals(equipment.getDepartmentId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Manager does not have authority over this department's equipment.");
        }

        if (!MaintenanceRequest.PENDING_VERIFICATION.equals(mr.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Work order must be PENDING_VERIFICATION to verify work.");
        }

        boolean approved = Boolean.TRUE.equals(dto.getApproved());
        String equipmentStatus = dto.getEquipmentStatus();

        if (approved) {
            mr.setStatus(MaintenanceRequest.COMPLETED);
            if (equipmentStatus == null || (!Equipment.AVAILABLE.equals(equipmentStatus) && !Equipment.OUT_OF_SERVICE.equals(equipmentStatus))) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Resulting equipment status must be AVAILABLE or OUT_OF_SERVICE.");
            }
            if (Equipment.AVAILABLE.equals(equipmentStatus)) {
                String resolutionSummary = dto.getResolutionSummary() != null && !dto.getResolutionSummary().isBlank()
                        ? dto.getResolutionSummary().trim()
                        : (dto.getManagerNotes() != null && !dto.getManagerNotes().isBlank() ? dto.getManagerNotes().trim() : null);
                if (resolutionSummary == null || resolutionSummary.isEmpty()) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "A problem resolution summary is mandatory when returning equipment to AVAILABLE.");
                }
                mr.setVerificationNotes(resolutionSummary);
            } else {
                mr.setVerificationNotes(dto.getManagerNotes() != null && !dto.getManagerNotes().isBlank() ? dto.getManagerNotes().trim() : "Marked Out of Service by Lab Manager.");
            }
            equipment.setStatus(equipmentStatus);
            equipmentRepository.save(equipment);

            // Create/finalize permanent MaintenanceRecord exactly once (deduplicated)
            boolean recordExists = maintenanceRecordRepository.findByEquipmentIdOrderByCreatedAtDesc(equipment.getEquipmentId()).stream()
                    .anyMatch(rec -> (mr.getIssueReportId() != null && mr.getIssueReportId().equals(rec.getIssueReportId())) ||
                                     (rec.getWorkPerformed() != null && rec.getWorkPerformed().equals(mr.getWorkPerformed())));
            if (!recordExists) {
                com.labresource.backend.maintenance.entity.MaintenanceRecord rec = new com.labresource.backend.maintenance.entity.MaintenanceRecord();
                rec.setEquipmentId(equipment.getEquipmentId());
                rec.setTechnicianId(mr.getAssignedTechnicianId());
                rec.setIssueReportId(mr.getIssueReportId());
                rec.setMaintenanceType("CORRECTIVE");
                rec.setStatus(com.labresource.backend.maintenance.entity.MaintenanceRecord.COMPLETED);
                rec.setPriority(mr.getPriority());
                rec.setReason(mr.getIssueType() != null ? mr.getIssueType() : "Corrective Maintenance");
                rec.setDescription(mr.getIssueDescription());
                rec.setInspectionNotes(mr.getDiagnosticNotes());
                rec.setWorkPerformed(mr.getWorkPerformed());
                rec.setPartsUsed(mr.getPartsUsed());
                rec.setConditionBefore(equipment.getCondition() != null ? equipment.getCondition() : "FAIR");
                rec.setConditionAfter(Equipment.AVAILABLE.equals(equipmentStatus) ? "EXCELLENT" : "POOR");
                rec.setStartedAt(mr.getDowntimeStartedAt());
                rec.setCompletedAt(mr.getCompletedAt() != null ? mr.getCompletedAt() : LocalDateTime.now());
                maintenanceRecordRepository.save(rec);
            }

            // Resolve linked issue report
            if (mr.getIssueReportId() != null) {
                issueReportRepository.findById(mr.getIssueReportId()).ifPresent(ir -> {
                    ir.setStatus("RESOLVED");
                    ir.setResolvedAt(LocalDateTime.now());
                    ir.setResolvedBy(userId);
                    ir.setResolutionNotes("Maintenance verified and completed.");
                    issueReportRepository.save(ir);

                    notificationService.notifyUser(
                            ir.getReportedBy(),
                            "ISSUE_RESOLVED",
                            "Issue Resolved",
                            "The reported issue for equipment \"" + equipment.getName() + "\" has been resolved."
                    );
                });
            }

            if (mr.getAssignedTechnicianId() != null) {
                notificationService.notifyUser(
                        mr.getAssignedTechnicianId(),
                        "MAINTENANCE_VERIFIED",
                        "Work Order Verified",
                        "Your work on work order " + mr.getMaintenanceCode() + " has been verified and completed."
                );
            }
        } else {
            String rejectReason = dto.getRejectionReason();
            if (rejectReason == null || rejectReason.trim().isEmpty()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "A rejection / rework reason is required when rejecting verification.");
            }

            mr.setStatus(MaintenanceRequest.REJECTED);
            mr.setVerificationNotes(rejectReason.trim());

            if (equipmentStatus != null && !equipmentStatus.isBlank() && !Equipment.AVAILABLE.equals(equipmentStatus)) {
                equipment.setStatus(equipmentStatus);
            } else {
                equipment.setStatus(Equipment.UNDER_MAINTENANCE);
            }
            equipmentRepository.save(equipment);

            // Transition COMPLETED assignment to REJECTED with notes
            assignmentRepository.findAll().stream()
                    .filter(a -> a.getMaintenanceId().equals(maintenanceId) && a.getTechnicianId().equals(mr.getAssignedTechnicianId()) && "COMPLETED".equals(a.getStatus()))
                    .findFirst()
                    .ifPresent(a -> {
                        a.setStatus("REJECTED");
                        a.setNotes("Rejected by manager: " + rejectReason.trim());
                        assignmentRepository.save(a);
                    });

            if (mr.getAssignedTechnicianId() != null) {
                notificationService.notifyUser(
                        mr.getAssignedTechnicianId(),
                        "MAINTENANCE_REJECTED",
                        "Work Order Rejected",
                        "Your work on work order " + mr.getMaintenanceCode() + " has been rejected by the manager. Reason: " + rejectReason.trim()
                );
            }
        }

        MaintenanceRequest saved = maintenanceRequestRepository.save(mr);
        MaintenanceRequestSummaryDto summaryDto = toSummaryDto(saved);
        try {
            messagingTemplate.convertAndSend("/topic/maintenance-updates", summaryDto);
        } catch (Exception e) {}
        return summaryDto;
    }

    @Transactional
    public MaintenanceRequestSummaryDto verifyWork(Long userId, Long maintenanceId, boolean approved, String equipmentStatus) {
        com.labresource.backend.maintenance.dto.ManagerVerifyRequestDto dto = new com.labresource.backend.maintenance.dto.ManagerVerifyRequestDto();
        dto.setApproved(approved);
        dto.setEquipmentStatus(equipmentStatus);
        dto.setManagerNotes(approved ? "Approved by Lab Manager." : null);
        dto.setRejectionReason(!approved ? "Requires rework." : null);
        return verifyWork(userId, maintenanceId, dto);
    }

    public List<TechnicianWorkloadDto> getEligibleTechnicians(Long maintenanceId, Long managerUserId) {
        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        Equipment equipment = equipmentRepository.findById(mr.getEquipmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));

        AppUser manager = appUserRepository.findById(managerUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Manager user not found."));

        boolean isSystemAdmin = manager.getRoles().stream()
                .anyMatch(r -> Role.SYSTEM_ADMIN.equals(r.getRoleName()));

        if (!isSystemAdmin && manager.getInstitutionId() != null && !manager.getInstitutionId().equals(equipment.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Manager does not have authority over equipment from another institution.");
        }

        if (!isSystemAdmin && manager.getDepartmentId() != null && !manager.getDepartmentId().equals(equipment.getDepartmentId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Manager does not have authority over equipment from another department.");
        }

        Long instId = !isSystemAdmin && manager.getInstitutionId() != null ? manager.getInstitutionId() : equipment.getInstitutionId();
        Long deptId = !isSystemAdmin && manager.getDepartmentId() != null ? manager.getDepartmentId() : equipment.getDepartmentId();

        List<AppUser> technicians;
        if (deptId != null) {
            technicians = appUserRepository.findByRoleNameAndInstitutionIdAndDepartmentIdAndIsActiveTrue(Role.LAB_TECHNICIAN, instId, deptId);
        } else {
            technicians = appUserRepository.findByRoleNameAndInstitutionIdAndIsActiveTrue(Role.LAB_TECHNICIAN, instId);
        }
        List<TechnicianWorkloadDto> dtos = new ArrayList<>();

        for (AppUser tech : technicians) {
            // Check availability
            boolean available = true;
            if (mr.getScheduledStartDatetime() != null && mr.getScheduledEndDatetime() != null) {
                List<TechnicianUnavailability> overlaps = unavailabilityRepository.findOverlappingActive(tech.getUserId(), mr.getScheduledStartDatetime(), mr.getScheduledEndDatetime());
                if (!overlaps.isEmpty()) {
                    available = false;
                }
            } else if (mr.getScheduledDate() != null) {
                LocalDateTime dayStart = mr.getScheduledDate().atStartOfDay();
                LocalDateTime dayEnd = mr.getScheduledDate().atTime(LocalTime.MAX);
                List<TechnicianUnavailability> overlaps = unavailabilityRepository.findOverlappingActive(tech.getUserId(), dayStart, dayEnd);
                if (!overlaps.isEmpty()) {
                    available = false;
                }
            } else {
                available = true; // Default available if no specific schedule date is set yet
            }

            if (available) {
                long activeWorkload = maintenanceRequestRepository.findByAssignedTechnicianId(tech.getUserId()).stream()
                        .filter(r -> !MaintenanceRequest.COMPLETED.equals(r.getStatus()) &&
                                     !MaintenanceRequest.REJECTED.equals(r.getStatus()) &&
                                     !MaintenanceRequest.CANCELLED.equals(r.getStatus()))
                        .count();

                dtos.add(new TechnicianWorkloadDto(
                        tech.getUserId(),
                        tech.getFirstName(),
                        tech.getLastName(),
                        tech.getEmail(),
                        activeWorkload
                ));
            }
        }

        dtos.sort(Comparator.comparingLong(TechnicianWorkloadDto::getActiveWorkload));
        return dtos;
    }

    public List<MaintenanceRequestSummaryDto> myReports(Long userId) {
        return maintenanceRequestRepository.findByRequestedByOrderByMaintenanceIdDesc(userId).stream()
                .map(m -> MaintenanceRequestSummaryDto.fromEntity(m, equipmentService.getEntity(m.getEquipmentId()).getName()))
                .toList();
    }

    private String resolveFullName(AppUser user) {
        if (user == null) return null;
        String fn = user.getFirstName();
        String ln = user.getLastName();
        StringBuilder sb = new StringBuilder();
        if (fn != null && !fn.isBlank()) sb.append(fn.trim());
        if (ln != null && !ln.isBlank()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(ln.trim());
        }
        if (sb.length() > 0) return sb.toString();
        return user.getEmail();
    }

    private MaintenanceRequestSummaryDto toSummaryDto(MaintenanceRequest m) {
        Equipment eq = equipmentRepository.findById(m.getEquipmentId()).orElse(null);
        String eqName = eq != null ? eq.getName() : "Unknown Equipment";
        String labName = null;
        if (eq != null && eq.getLabId() != null) {
            labName = laboratoryRepository.findById(eq.getLabId())
                    .map(com.labresource.backend.laboratory.entity.Laboratory::getName)
                    .orElse(null);
        }

        String departmentName = null;
        Long deptId = m.getDepartmentId() != null ? m.getDepartmentId() : (eq != null ? eq.getDepartmentId() : null);
        if (deptId != null) {
            departmentName = departmentRepository.findById(deptId)
                    .map(com.labresource.backend.department.entity.Department::getName)
                    .orElse(null);
        }

        String requestedByName = null;
        if (m.getRequestedBy() != null) {
            requestedByName = appUserRepository.findById(m.getRequestedBy())
                    .map(this::resolveFullName)
                    .orElse(null);
        }

        MaintenanceAssignment ma = assignmentRepository.findByMaintenanceId(m.getMaintenanceId()).stream()
                .filter(a -> !"REMOVED".equals(a.getStatus()) && !"REASSIGNED".equals(a.getStatus()))
                .max(Comparator.comparing(MaintenanceAssignment::getAssignmentId))
                .orElse(null);

        String assignedByName = null;
        if (ma != null && ma.getAssignedBy() != null) {
            assignedByName = appUserRepository.findById(ma.getAssignedBy())
                    .map(this::resolveFullName)
                    .orElse(null);
        }

        String assignedTechnicianName = null;
        Long techId = m.getAssignedTechnicianId() != null ? m.getAssignedTechnicianId() : (ma != null ? ma.getTechnicianId() : null);
        if (techId != null) {
            assignedTechnicianName = appUserRepository.findById(techId)
                    .map(this::resolveFullName)
                    .orElse(null);
        }

        MaintenanceRequestSummaryDto dto = MaintenanceRequestSummaryDto.fromEntity(m, eqName, ma);
        dto.setLabName(labName);
        dto.setDepartmentName(departmentName);
        dto.setRequestedByName(requestedByName);
        dto.setAssignedByName(assignedByName);
        dto.setAssignedTechnicianName(assignedTechnicianName);
        return dto;
    }

    public List<MaintenanceRequestSummaryDto> getDepartmentWorkOrders(Long departmentId) {
        return getDepartmentWorkOrders(departmentId, null);
    }

    public List<MaintenanceRequestSummaryDto> getDepartmentWorkOrders(Long departmentId, Long institutionId) {
        List<MaintenanceRequest> requests;
        if (departmentId != null) {
            requests = maintenanceRequestRepository.findByDepartmentIdOrderByMaintenanceIdDesc(departmentId);
        } else if (institutionId != null) {
            List<Long> equipmentIds = equipmentRepository.findByInstitutionId(institutionId).stream()
                    .map(Equipment::getEquipmentId)
                    .toList();
            if (equipmentIds.isEmpty()) {
                requests = List.of();
            } else {
                requests = maintenanceRequestRepository.findByEquipmentIdInOrderByMaintenanceIdDesc(equipmentIds);
            }
        } else {
            requests = maintenanceRequestRepository.findAllByOrderByMaintenanceIdDesc();
        }
        return requests.stream()
                .map(this::toSummaryDto)
                .toList();
    }

    @Transactional
    public List<MaintenanceRequestSummaryDto> getTechnicianTasks(Long technicianId) {
        List<MaintenanceRequest> tasks = maintenanceRequestRepository.findByAssignedTechnicianId(technicianId);
        LocalDateTime now = LocalDateTime.now();
        for (MaintenanceRequest m : tasks) {
            List<MaintenanceAssignment> assignments = assignmentRepository.findByMaintenanceId(m.getMaintenanceId());
            for (MaintenanceAssignment ma : assignments) {
                if (ma.getTechnicianId().equals(technicianId) && ma.getTechnicianSeenAt() == null) {
                    ma.setTechnicianSeenAt(now);
                    assignmentRepository.save(ma);
                }
            }
        }
        return tasks.stream()
                .map(this::toSummaryDto)
                .toList();
    }

    // ── MaintenanceRecord Operations (Phase 2 & Phase 3) ──────────────────────

    @Transactional
    public com.labresource.backend.maintenance.dto.MaintenanceRecordDto createMaintenanceRecord(
            Long equipmentId, Long technicianId, String type, String priority, String reason, String description, Long issueReportId) {
        com.labresource.backend.maintenance.entity.MaintenanceRecord record = new com.labresource.backend.maintenance.entity.MaintenanceRecord();
        record.setEquipmentId(equipmentId);
        record.setTechnicianId(technicianId);
        record.setIssueReportId(issueReportId);
        record.setMaintenanceType(type != null ? type.toUpperCase() : "CORRECTIVE");
        record.setPriority(priority != null ? priority.toUpperCase() : "MEDIUM");
        record.setReason(reason);
        record.setDescription(description);
        record.setStatus(com.labresource.backend.maintenance.entity.MaintenanceRecord.PENDING);

        com.labresource.backend.maintenance.entity.MaintenanceRecord saved = maintenanceRecordRepository.save(record);

        if (issueReportId != null) {
            issueReportRepository.findById(issueReportId).ifPresent(ir -> {
                ir.setMaintenanceId(saved.getMaintenanceId());
                ir.setStatus("UNDER_INSPECTION");
                issueReportRepository.save(ir);
            });
        }

        return buildRecordDto(saved);
    }

    @Transactional
    public com.labresource.backend.maintenance.dto.MaintenanceRecordDto startMaintenanceRecord(Long maintenanceId, Long technicianId) {
        com.labresource.backend.maintenance.entity.MaintenanceRecord rec = maintenanceRecordRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Maintenance record not found."));

        rec.setStatus(com.labresource.backend.maintenance.entity.MaintenanceRecord.IN_PROGRESS);
        if (rec.getTechnicianId() == null) {
            rec.setTechnicianId(technicianId);
        }
        rec.setStartedAt(LocalDateTime.now());

        Equipment eq = equipmentRepository.findById(rec.getEquipmentId()).orElse(null);
        if (eq != null) {
            eq.setStatus(Equipment.UNDER_MAINTENANCE);
            equipmentRepository.save(eq);
        }

        return buildRecordDto(maintenanceRecordRepository.save(rec));
    }

    @Transactional
    public com.labresource.backend.maintenance.dto.MaintenanceRecordDto completeMaintenanceRecord(
            Long maintenanceId, BigDecimal partsCost, BigDecimal labourCost, String workPerformed, String partsUsed, String conditionAfter, LocalDate nextDate) {

        com.labresource.backend.maintenance.entity.MaintenanceRecord rec = maintenanceRecordRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Maintenance record not found."));

        // Idempotency check: If already completed, skip duplicate cost creation & budget update!
        if (com.labresource.backend.maintenance.entity.MaintenanceRecord.COMPLETED.equals(rec.getStatus())) {
            return buildRecordDto(rec);
        }

        BigDecimal safeParts = partsCost != null && partsCost.compareTo(BigDecimal.ZERO) >= 0 ? partsCost : BigDecimal.ZERO;
        BigDecimal safeLabour = labourCost != null && labourCost.compareTo(BigDecimal.ZERO) >= 0 ? labourCost : BigDecimal.ZERO;
        BigDecimal totalCost = safeParts.add(safeLabour); // BACKEND CALCULATED TOTAL COST!

        rec.setPartsCost(safeParts);
        rec.setLabourCost(safeLabour);
        rec.setTotalCost(totalCost);
        rec.setWorkPerformed(workPerformed);
        rec.setPartsUsed(partsUsed);
        rec.setConditionAfter(conditionAfter != null ? conditionAfter : "Good");
        rec.setNextMaintenanceDate(nextDate);
        rec.setStatus(com.labresource.backend.maintenance.entity.MaintenanceRecord.COMPLETED);
        rec.setCompletedAt(LocalDateTime.now());

        com.labresource.backend.maintenance.entity.MaintenanceRecord saved = maintenanceRecordRepository.save(rec);

        Equipment eq = equipmentRepository.findById(saved.getEquipmentId()).orElse(null);
        if (eq != null) {
            eq.setStatus(Equipment.AVAILABLE);
            equipmentRepository.save(eq);

            // Idempotency check: Ensure no duplicate CostRecord for maintenance_id
            boolean costExists = costRecordRepository.findByEquipmentId(eq.getEquipmentId()).stream()
                    .anyMatch(c -> saved.getMaintenanceId().equals(c.getMaintenanceId()) && "MAINTENANCE".equals(c.getCostType()));

            if (!costExists && totalCost.compareTo(BigDecimal.ZERO) > 0) {
                com.labresource.backend.billing.entity.CostRecord costRecord = new com.labresource.backend.billing.entity.CostRecord();
                costRecord.setEquipmentId(eq.getEquipmentId());
                costRecord.setDepartmentId(eq.getDepartmentId());
                costRecord.setInstitutionId(eq.getInstitutionId());
                costRecord.setMaintenanceId(saved.getMaintenanceId());
                costRecord.setCostType("MAINTENANCE"); // Expense type
                costRecord.setAmount(totalCost);
                costRecord.setCurrency("INR");
                costRecord.setBillingPeriod(com.labresource.backend.budget.util.FiscalYearUtil.getCurrentFiscalYear());
                costRecordRepository.save(costRecord);

                // Increment department used_amount in Budget (Single Source of Truth)
                String fiscalYear = com.labresource.backend.budget.util.FiscalYearUtil.getCurrentFiscalYear();
                com.labresource.backend.budget.entity.Budget budget = budgetRepository.findByDepartmentIdAndFiscalYear(eq.getDepartmentId(), fiscalYear)
                        .orElseGet(() -> {
                            com.labresource.backend.budget.entity.Budget b = new com.labresource.backend.budget.entity.Budget();
                            b.setInstitutionId(eq.getInstitutionId());
                            b.setDepartmentId(eq.getDepartmentId());
                            b.setFiscalYear(fiscalYear);
                            b.setAllocatedAmount(BigDecimal.ZERO);
                            b.setUsedAmount(BigDecimal.ZERO);
                            b.setRemainingAmount(BigDecimal.ZERO);
                            return b;
                        });

                BigDecimal newUsed = budget.getUsedAmount().add(totalCost);
                budget.setUsedAmount(newUsed);
                budget.setRemainingAmount(budget.getAllocatedAmount().subtract(newUsed));
                budgetRepository.save(budget);
            }
        }

        return buildRecordDto(saved);
    }

    public List<com.labresource.backend.maintenance.dto.MaintenanceRecordDto> getMaintenanceHistory(Long equipmentId) {
        return maintenanceRecordRepository.findByEquipmentIdOrderByCreatedAtDesc(equipmentId).stream()
                .map(this::buildRecordDto)
                .toList();
    }

    private com.labresource.backend.maintenance.dto.MaintenanceRecordDto buildRecordDto(com.labresource.backend.maintenance.entity.MaintenanceRecord rec) {
        Equipment eq = equipmentRepository.findById(rec.getEquipmentId()).orElse(null);
        String eqName = eq != null ? eq.getName() : "Equipment #" + rec.getEquipmentId();

        String labName = null;
        if (eq != null && eq.getLabId() != null) {
            labName = laboratoryRepository.findById(eq.getLabId()).map(l -> l.getName()).orElse(null);
        }

        String deptName = eq != null ? departmentRepository.findById(eq.getDepartmentId()).map(d -> d.getName()).orElse("Department") : "Department";
        String techName = rec.getTechnicianId() != null ? appUserRepository.findById(rec.getTechnicianId()).map(u -> u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).orElse("Unassigned") : "Unassigned";

        com.labresource.backend.maintenance.dto.MaintenanceRecordDto dto = com.labresource.backend.maintenance.dto.MaintenanceRecordDto.fromEntity(rec, eqName, labName, deptName, techName);
        if (eq != null) {
            dto.setLabId(eq.getLabId());
            dto.setDepartmentId(eq.getDepartmentId());
        }
        return dto;
    }

    @Transactional
    public MaintenanceRequestSummaryDto acceptSchedule(Long userId, Long maintenanceId) {
        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        if (MaintenanceRequest.CANCELLED.equals(mr.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Work order is cancelled.");
        }

        if (!userId.equals(mr.getAssignedTechnicianId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the assigned technician can accept the schedule.");
        }

        List<MaintenanceAssignment> assignments = assignmentRepository.findByMaintenanceId(maintenanceId);
        MaintenanceAssignment activeAssignment = assignments.stream()
                .filter(a -> a.getTechnicianId().equals(userId) && !"REMOVED".equals(a.getStatus()) && !"REASSIGNED".equals(a.getStatus()))
                .max(Comparator.comparing(MaintenanceAssignment::getAssignmentId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Active technician assignment not found."));

        if (activeAssignment.getTechnicianResponse() != null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Technician has already responded to this schedule.");
        }

        LocalDateTime now = LocalDateTime.now();
        activeAssignment.setTechnicianResponse("ACCEPTED");
        activeAssignment.setTechnicianAcceptedAt(now);
        activeAssignment.setTechnicianAcknowledgedAt(now);
        assignmentRepository.save(activeAssignment);

        LocalDateTime finalStart = mr.getManagerTargetStartDatetime() != null ? mr.getManagerTargetStartDatetime() : mr.getScheduledStartDatetime();
        LocalDateTime finalEnd = mr.getManagerTargetEndDatetime() != null ? mr.getManagerTargetEndDatetime() : mr.getScheduledEndDatetime();

        mr.setFinalStartDatetime(finalStart);
        mr.setFinalEndDatetime(finalEnd);
        mr.setScheduledStartDatetime(finalStart);
        mr.setScheduledEndDatetime(finalEnd);
        if (finalStart != null) {
            mr.setScheduledDate(finalStart.toLocalDate());
        }
        mr.setStatus(MaintenanceRequest.ACCEPTED);
        MaintenanceRequest saved = maintenanceRequestRepository.save(mr);

        Equipment eq = equipmentRepository.findById(saved.getEquipmentId()).orElse(null);
        String eqName = eq != null ? eq.getName() : "Equipment";

        MaintenanceRequestSummaryDto dto = MaintenanceRequestSummaryDto.fromEntity(saved, eqName, activeAssignment);

        try {
            messagingTemplate.convertAndSend("/topic/maintenance-updates", dto);
        } catch (Exception e) {
            // Log WS error
        }

        // Notify Managers
        notificationService.notifyDepartmentLabManagers(
                saved.getDepartmentId(),
                "TECHNICIAN_ACCEPTED_SCHEDULE",
                "Technician Accepted Maintenance Schedule",
                "Technician accepted the target maintenance schedule for work order " + saved.getMaintenanceCode()
        );

        return dto;
    }

    @Transactional
    public MaintenanceRequestSummaryDto acceptTechnicianProposal(Long managerUserId, Long maintenanceId, String managerNotes) {
        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        if (MaintenanceRequest.CANCELLED.equals(mr.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Work order is cancelled.");
        }

        AppUser manager = appUserRepository.findById(managerUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Manager user not found."));

        Equipment equipment = equipmentRepository.findById(mr.getEquipmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));

        if (!manager.getInstitutionId().equals(equipment.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Manager does not belong to the institution of this equipment.");
        }
        boolean isSystemOrInstAdmin = manager.getRoles().stream()
                .anyMatch(r -> Role.SYSTEM_ADMIN.equals(r.getRoleName()) || Role.INSTITUTION_ADMIN.equals(r.getRoleName()));
        if (manager.getDepartmentId() != null && !manager.getDepartmentId().equals(equipment.getDepartmentId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Manager does not have authority over this department's equipment.");
        }

        if (!MaintenanceRequest.PENDING_MANAGER_REVIEW.equals(mr.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Work order must be PENDING_MANAGER_REVIEW to accept proposal.");
        }

        LocalDateTime start = mr.getProposedStartDatetime() != null ? mr.getProposedStartDatetime() : mr.getScheduledStartDatetime();
        LocalDateTime end = mr.getProposedEndDatetime() != null ? mr.getProposedEndDatetime() : mr.getScheduledEndDatetime();

        mr.setFinalStartDatetime(start);
        mr.setFinalEndDatetime(end);
        mr.setScheduledStartDatetime(start);
        mr.setScheduledEndDatetime(end);
        if (start != null) {
            mr.setScheduledDate(start.toLocalDate());
        }
        mr.setFinalizedBy(managerUserId);
        mr.setFinalizedAt(LocalDateTime.now());
        if (managerNotes != null && !managerNotes.isBlank()) {
            mr.setManagerNotes(managerNotes.trim());
        }
        mr.setStatus(MaintenanceRequest.FINALIZED);

        // Update active assignment
        assignmentRepository.findByMaintenanceId(maintenanceId).stream()
                .filter(a -> a.getTechnicianId().equals(mr.getAssignedTechnicianId()) && !"REMOVED".equals(a.getStatus()) && !"CANCELLED".equals(a.getStatus()))
                .findFirst()
                .ifPresent(a -> {
                    a.setTargetStartDatetime(start);
                    a.setTargetCompletionDatetime(end);
                    assignmentRepository.save(a);
                });

        MaintenanceRequest saved = maintenanceRequestRepository.save(mr);

        Equipment eq = equipmentRepository.findById(saved.getEquipmentId()).orElse(null);
        String eqName = eq != null ? eq.getName() : "Equipment";

        MaintenanceRequestSummaryDto dto = MaintenanceRequestSummaryDto.fromEntity(saved, eqName);

        try {
            messagingTemplate.convertAndSend("/topic/maintenance-updates", dto);
        } catch (Exception e) {}

        if (saved.getAssignedTechnicianId() != null) {
            notificationService.notifyUser(
                    saved.getAssignedTechnicianId(),
                    "SCHEDULE_FINALIZED",
                    "Technician Proposal Accepted",
                    "Lab Manager has accepted your proposed maintenance schedule for work order " + saved.getMaintenanceCode()
            );
        }

        return dto;
    }

    @Transactional
    public MaintenanceRequestSummaryDto submitRepairPlan(Long userId, Long maintenanceId, LocalDateTime proposedStart, LocalDateTime proposedEnd, String delayReason, Boolean requiresParts, String partsDetails) {
        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        if (MaintenanceRequest.CANCELLED.equals(mr.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Work order is cancelled and cannot be updated.");
        }

        if (!userId.equals(mr.getAssignedTechnicianId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the assigned technician can submit the repair plan.");
        }

        List<MaintenanceAssignment> assignments = assignmentRepository.findByMaintenanceId(maintenanceId);
        MaintenanceAssignment activeAssignment = assignments.stream()
                .filter(a -> a.getTechnicianId().equals(userId) && !"REMOVED".equals(a.getStatus()) && !"REASSIGNED".equals(a.getStatus()))
                .max(Comparator.comparing(MaintenanceAssignment::getAssignmentId))
                .orElse(null);

        if (activeAssignment != null && activeAssignment.getTechnicianResponse() != null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Technician has already responded to this schedule.");
        }

        if (delayReason == null || delayReason.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Technical justification / delay reason is required before submitting the repair plan.");
        }

        if (proposedStart == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Proposed start datetime is required.");
        }

        if (proposedEnd == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Proposed end datetime is required.");
        }

        if (!proposedEnd.isAfter(proposedStart)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Proposed end datetime must be after proposed start datetime.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (activeAssignment != null) {
            activeAssignment.setTechnicianResponse("DELAY_REQUESTED");
            activeAssignment.setNotes(delayReason.trim());
            assignmentRepository.save(activeAssignment);
        }

        mr.setProposedStartDatetime(proposedStart);
        mr.setProposedEndDatetime(proposedEnd);
        mr.setDelayReason(delayReason.trim());
        mr.setRequiresParts(requiresParts != null ? requiresParts : false);
        mr.setPartsDetails(partsDetails != null ? partsDetails.trim() : null);
        mr.setPlanSubmittedAt(now);
        mr.setStatus(MaintenanceRequest.PENDING_MANAGER_REVIEW);

        MaintenanceRequest saved = maintenanceRequestRepository.save(mr);

        Equipment eq = equipmentRepository.findById(saved.getEquipmentId()).orElse(null);
        String eqName = eq != null ? eq.getName() : "Equipment";

        MaintenanceRequestSummaryDto dto = MaintenanceRequestSummaryDto.fromEntity(saved, eqName, activeAssignment);

        try {
            messagingTemplate.convertAndSend("/topic/maintenance-updates", dto);
        } catch (Exception e) {
            // Log WS error
        }

        // Notify Managers
        notificationService.notifyDepartmentLabManagers(
                saved.getDepartmentId(),
                "TECHNICIAN_REQUESTED_SCHEDULE_CHANGE",
                "Technician Submitted Repair Plan",
                "Technician submitted repair plan for work order " + saved.getMaintenanceCode() + ". Justification: " + delayReason
        );

        return dto;
    }

    public MaintenanceRequestSummaryDto submitRepairPlan(Long userId, Long maintenanceId, LocalDateTime proposedStart, LocalDateTime proposedEnd, String delayReason) {
        return submitRepairPlan(userId, maintenanceId, proposedStart, proposedEnd, delayReason, false, null);
    }

    @Transactional
    public MaintenanceRequestSummaryDto finalizeSchedule(Long managerUserId, Long maintenanceId, LocalDateTime finalStart, LocalDateTime finalEnd, LocalDate finalDueDate, String managerNotes) {
        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        if (MaintenanceRequest.CANCELLED.equals(mr.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Work order is cancelled.");
        }

        AppUser manager = appUserRepository.findById(managerUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Manager user not found."));

        if (finalStart != null && finalEnd != null && !finalEnd.isAfter(finalStart)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Final end datetime must be after final start datetime.");
        }

        mr.setFinalStartDatetime(finalStart != null ? finalStart : mr.getProposedStartDatetime());
        mr.setFinalEndDatetime(finalEnd != null ? finalEnd : mr.getProposedEndDatetime());
        mr.setFinalizedBy(managerUserId);
        mr.setFinalizedAt(LocalDateTime.now());

        mr.setScheduledStartDatetime(mr.getFinalStartDatetime());
        mr.setScheduledEndDatetime(mr.getFinalEndDatetime());
        if (mr.getFinalStartDatetime() != null) {
            mr.setScheduledDate(mr.getFinalStartDatetime().toLocalDate());
        }
        if (finalDueDate != null) {
            mr.setFinalDueDate(finalDueDate);
        }
        if (managerNotes != null) {
            mr.setManagerNotes(managerNotes.trim());
        }

        mr.setDelayDecidedBy(managerUserId);
        mr.setDelayDecidedAt(LocalDateTime.now());
        mr.setStatus(MaintenanceRequest.FINALIZED);

        MaintenanceRequest saved = maintenanceRequestRepository.save(mr);

        Equipment eq = equipmentRepository.findById(saved.getEquipmentId()).orElse(null);
        String eqName = eq != null ? eq.getName() : "Equipment";

        MaintenanceRequestSummaryDto dto = MaintenanceRequestSummaryDto.fromEntity(saved, eqName);

        // STOMP WebSocket Real-time Broadcast to Technician
        try {
            messagingTemplate.convertAndSend("/topic/maintenance-updates", dto);
        } catch (Exception e) {
            // Log warning if WS broadcast encounters issue
        }

        if (saved.getAssignedTechnicianId() != null) {
            notificationService.notifyUser(
                    saved.getAssignedTechnicianId(),
                    "SCHEDULE_FINALIZED",
                    "Final Schedule Directives Set",
                    "Lab Manager has set final repair dates for " + saved.getMaintenanceCode()
            );
        }

        return dto;
    }

    @Transactional
    public MaintenanceRequestSummaryDto cancelAssignment(Long technicianUserId, Long maintenanceId) {
        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        if (!technicianUserId.equals(mr.getAssignedTechnicianId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not assigned to this work order.");
        }

        if (!MaintenanceRequest.ASSIGNED.equals(mr.getStatus()) && !"PENDING_TECHNICIAN_RESPONSE".equals(mr.getStatus())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot cancel task assignment after submitting repair plan or when under review/finalized.");
        }

        mr.setStatus(MaintenanceRequest.CANCELLED);
        mr.setAssignedTechnicianId(null);

        MaintenanceRequest saved = maintenanceRequestRepository.save(mr);

        List<MaintenanceAssignment> assignments = assignmentRepository.findByTechnicianIdAndStatus(technicianUserId, "ASSIGNED");
        for (MaintenanceAssignment ma : assignments) {
            if (ma.getMaintenanceId().equals(maintenanceId)) {
                ma.setStatus("CANCELLED");
                ma.setCompletedAt(LocalDateTime.now());
                assignmentRepository.save(ma);
            }
        }

        Equipment eq = equipmentRepository.findById(saved.getEquipmentId()).orElse(null);
        String eqName = eq != null ? eq.getName() : "Equipment";

        return MaintenanceRequestSummaryDto.fromEntity(saved, eqName);
    }

    @Transactional
    public MaintenanceRequestSummaryDto cancelByManager(Long managerUserId, Long maintenanceId, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cancellation reason is required.");
        }

        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        AppUser manager = appUserRepository.findById(managerUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Manager user not found."));

        boolean isAuthorizedRole = manager.getRoles().stream()
                .anyMatch(r -> Role.LAB_MANAGER.equals(r.getRoleName()) ||
                               Role.DEPARTMENT_HEAD.equals(r.getRoleName()) ||
                               Role.SYSTEM_ADMIN.equals(r.getRoleName()) ||
                               Role.INSTITUTION_ADMIN.equals(r.getRoleName()));
        if (!isAuthorizedRole) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only authorized Lab Managers, Department Heads, or Admins can cancel maintenance requests.");
        }

        Equipment equipment = equipmentRepository.findById(mr.getEquipmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));

        // Institutional isolation check
        if (!manager.getInstitutionId().equals(equipment.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Manager/Department Head does not belong to the institution of this equipment.");
        }

        // Department authority check for LAB_MANAGER and DEPARTMENT_HEAD
        boolean isSystemOrInstAdmin = manager.getRoles().stream()
                .anyMatch(r -> Role.SYSTEM_ADMIN.equals(r.getRoleName()) || Role.INSTITUTION_ADMIN.equals(r.getRoleName()));

        if (manager.getDepartmentId() != null && !manager.getDepartmentId().equals(equipment.getDepartmentId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "User does not have authority over this department's equipment.");
        }

        mr.setStatus(MaintenanceRequest.CANCELLED);
        mr.setCancelledBy(managerUserId);
        mr.setCancelledAt(LocalDateTime.now());
        mr.setCancellationReason(reason.trim());

        MaintenanceRequest saved = maintenanceRequestRepository.save(mr);

        // Cancel all assignments for this maintenance
        List<MaintenanceAssignment> assignments = assignmentRepository.findAll().stream()
                .filter(a -> a.getMaintenanceId().equals(maintenanceId) && !"CANCELLED".equals(a.getStatus()))
                .toList();
        for (MaintenanceAssignment ma : assignments) {
            ma.setStatus("CANCELLED");
            ma.setNotes("Cancelled by Manager/Dept Head: " + reason.trim());
            assignmentRepository.save(ma);
        }

        // Check if another active maintenance request exists for this equipment that is IN_PROGRESS
        List<MaintenanceRequest> otherInProgressRequests = maintenanceRequestRepository.findByEquipmentId(equipment.getEquipmentId()).stream()
                .filter(r -> !r.getMaintenanceId().equals(maintenanceId) &&
                             MaintenanceRequest.IN_PROGRESS.equals(r.getStatus()))
                .toList();

        if (otherInProgressRequests.isEmpty()) {
            equipment.setStatus(Equipment.AVAILABLE);
            equipmentRepository.save(equipment);
        } else {
            equipment.setStatus(Equipment.UNDER_MAINTENANCE);
            equipmentRepository.save(equipment);
        }

        // Also update linked issue report if exists
        if (mr.getIssueReportId() != null) {
            issueReportRepository.findById(mr.getIssueReportId()).ifPresent(ir -> {
                ir.setStatus("CANCELLED");
                issueReportRepository.save(ir);
            });
        }

        MaintenanceRequestSummaryDto dto = MaintenanceRequestSummaryDto.fromEntity(saved, equipment.getName());

        // STOMP WebSocket Real-time Broadcast
        try {
            messagingTemplate.convertAndSend("/topic/maintenance-updates", dto);
        } catch (Exception e) {
            // Log warning if WS broadcast fails
        }

        notificationService.notifyUser(
                saved.getRequestedBy(),
                "MAINTENANCE_CANCELLED",
                "Work Order Cancelled",
                "Work order " + saved.getMaintenanceCode() + " was cancelled: " + reason.trim()
        );

        if (saved.getAssignedTechnicianId() != null) {
            notificationService.notifyUser(
                    saved.getAssignedTechnicianId(),
                    "MAINTENANCE_CANCELLED",
                    "Work Order Cancelled",
                    "Work order " + saved.getMaintenanceCode() + " assigned to you was cancelled: " + reason.trim()
            );
        }

        return dto;
    }

    @Transactional
    public MaintenanceRequestSummaryDto removeAssignment(Long managerUserId, Long maintenanceId, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Removal reason is required.");
        }

        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        AppUser manager = appUserRepository.findById(managerUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Manager user not found."));

        Equipment equipment = equipmentRepository.findById(mr.getEquipmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));

        if (!manager.getInstitutionId().equals(equipment.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "User does not belong to the institution of this equipment.");
        }
        boolean isSystemOrInstAdmin = manager.getRoles().stream()
                .anyMatch(r -> Role.SYSTEM_ADMIN.equals(r.getRoleName()) || Role.INSTITUTION_ADMIN.equals(r.getRoleName()));
        if (manager.getDepartmentId() != null && !manager.getDepartmentId().equals(equipment.getDepartmentId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "User does not have authority over this department's equipment.");
        }

        if (!MaintenanceRequest.ASSIGNED.equals(mr.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Assignment can only be removed before technician has responded.");
        }

        List<MaintenanceAssignment> activeAssignments = assignmentRepository.findByMaintenanceIdAndStatus(maintenanceId, "ASSIGNED");
        for (MaintenanceAssignment ma : activeAssignments) {
            ma.setStatus("REMOVED");
            ma.setCompletedAt(LocalDateTime.now());
            ma.setRemovedBy(managerUserId);
            ma.setRemovedAt(LocalDateTime.now());
            ma.setRemovalReason(reason.trim());
            ma.setNotes(reason.trim());
            assignmentRepository.save(ma);

            notificationService.notifyUser(
                    ma.getTechnicianId(),
                    "ASSIGNMENT_REMOVED",
                    "Assignment Removed",
                    "Your assignment for work order " + mr.getMaintenanceCode() + " was removed. Reason: " + reason.trim()
            );
        }

        mr.setAssignedTechnicianId(null);
        mr.setStatus(MaintenanceRequest.OPEN);

        MaintenanceRequest saved = maintenanceRequestRepository.save(mr);
        MaintenanceRequestSummaryDto dto = MaintenanceRequestSummaryDto.fromEntity(saved, equipment.getName());
        try {
            messagingTemplate.convertAndSend("/topic/maintenance-updates", dto);
        } catch (Exception e) {}
        return dto;
    }

    public MaintenanceRequestSummaryDto removeAssignment(Long managerUserId, Long maintenanceId) {
        return removeAssignment(managerUserId, maintenanceId, "Assignment removed by manager.");
    }

    @Transactional
    public MaintenanceRequestSummaryDto reassignTechnician(Long managerUserId, Long maintenanceId, Long newTechnicianId, LocalDateTime targetStart, LocalDateTime targetEnd, String instructions, String reason) {
        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        AppUser manager = appUserRepository.findById(managerUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Manager user not found."));

        Equipment equipment = equipmentRepository.findById(mr.getEquipmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));

        if (!manager.getInstitutionId().equals(equipment.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "User does not belong to the institution of this equipment.");
        }
        boolean isSystemOrInstAdmin = manager.getRoles().stream()
                .anyMatch(r -> Role.SYSTEM_ADMIN.equals(r.getRoleName()) || Role.INSTITUTION_ADMIN.equals(r.getRoleName()));
        if (manager.getDepartmentId() != null && !manager.getDepartmentId().equals(equipment.getDepartmentId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "User does not have authority over this department's equipment.");
        }

        Long prevAssignmentId = null;
        List<MaintenanceAssignment> activeAssignments = assignmentRepository.findByMaintenanceIdAndStatus(maintenanceId, "ASSIGNED");
        for (MaintenanceAssignment ma : activeAssignments) {
            ma.setStatus("REASSIGNED");
            ma.setCompletedAt(LocalDateTime.now());
            ma.setRemovedBy(managerUserId);
            ma.setRemovedAt(LocalDateTime.now());
            ma.setRemovalReason(reason != null && !reason.isBlank() ? reason.trim() : "Reassigned to new technician.");
            assignmentRepository.save(ma);
            prevAssignmentId = ma.getAssignmentId();
        }

        String existingProblemDesc = activeAssignments.isEmpty() ? null : activeAssignments.get(0).getProblemDescription();
        String problemDesc = existingProblemDesc != null && !existingProblemDesc.isBlank() ? existingProblemDesc : "Reassigned task";

        assignTechnicianInternal(managerUserId, mr, newTechnicianId, targetStart, targetEnd, problemDesc, instructions);

        List<MaintenanceAssignment> newActive = assignmentRepository.findByMaintenanceIdAndStatus(maintenanceId, "ASSIGNED");
        if (!newActive.isEmpty() && prevAssignmentId != null) {
            MaintenanceAssignment latest = newActive.get(newActive.size() - 1);
            latest.setReassignedFromAssignmentId(prevAssignmentId);
            assignmentRepository.save(latest);
        }

        MaintenanceRequest saved = maintenanceRequestRepository.save(mr);
        MaintenanceRequestSummaryDto dto = toSummaryDto(saved);
        try {
            messagingTemplate.convertAndSend("/topic/maintenance-updates", dto);
        } catch (Exception e) {}
        return dto;
    }

    @Transactional
    public MaintenanceRequestSummaryDto editMaintenance(Long userId, Long maintenanceId, com.labresource.backend.maintenance.dto.MaintenanceEditDto dto) {
        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));

        Equipment equipment = equipmentRepository.findById(mr.getEquipmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));

        if (!user.getInstitutionId().equals(equipment.getInstitutionId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "User does not belong to the institution of this equipment.");
        }
        boolean isSystemOrInstAdmin = user.getRoles().stream()
                .anyMatch(r -> Role.SYSTEM_ADMIN.equals(r.getRoleName()) || Role.INSTITUTION_ADMIN.equals(r.getRoleName()));
        if (user.getDepartmentId() != null && !user.getDepartmentId().equals(equipment.getDepartmentId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "User does not have authority over this department's equipment.");
        }

        if (MaintenanceRequest.COMPLETED.equals(mr.getStatus()) || MaintenanceRequest.CANCELLED.equals(mr.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Completed or cancelled maintenance requests cannot be edited.");
        }

        if (dto != null) {
            if (dto.getIssueDescription() != null && !dto.getIssueDescription().isBlank()) {
                mr.setIssueDescription(dto.getIssueDescription().trim());
            }
            if (dto.getPriority() != null && !dto.getPriority().isBlank()) {
                mr.setPriority(dto.getPriority().toUpperCase().trim());
            }
            if (dto.getIssueType() != null && !dto.getIssueType().isBlank()) {
                mr.setIssueType(dto.getIssueType().trim());
            }
            if (dto.getScheduledStartDatetime() != null) {
                mr.setScheduledStartDatetime(dto.getScheduledStartDatetime());
            }
            if (dto.getScheduledEndDatetime() != null) {
                mr.setScheduledEndDatetime(dto.getScheduledEndDatetime());
            }
            if (dto.getScheduledDate() != null) {
                mr.setScheduledDate(dto.getScheduledDate());
            }
            if (dto.getFinalDueDate() != null) {
                mr.setFinalDueDate(dto.getFinalDueDate());
            }
            if (dto.getManagerNotes() != null) {
                mr.setManagerNotes(dto.getManagerNotes());
            }
        }

        MaintenanceRequest saved = maintenanceRequestRepository.save(mr);
        return MaintenanceRequestSummaryDto.fromEntity(saved, equipment.getName());
    }
}
