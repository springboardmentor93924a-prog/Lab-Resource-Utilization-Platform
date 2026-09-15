package com.labresource.backend.maintenance.controller;

import com.labresource.backend.maintenance.dto.MaintenanceReportDto;
import com.labresource.backend.maintenance.dto.MaintenanceRequestSummaryDto;
import com.labresource.backend.maintenance.dto.TechnicianWorkloadDto;
import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.maintenance.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping("/report")
    @PreAuthorize("hasAuthority('REPORT_EQUIPMENT_ISSUE')")
    public MaintenanceRequestSummaryDto report(@AuthenticationPrincipal UserPrincipal principal,
                                                @Valid @RequestBody MaintenanceReportDto request) {
        return maintenanceService.report(principal.getUserId(), request);
    }

    @GetMapping("/my")
    public List<MaintenanceRequestSummaryDto> myReports(@AuthenticationPrincipal UserPrincipal principal) {
        return maintenanceService.myReports(principal.getUserId());
    }

    @PostMapping("/promote")
    @PreAuthorize("hasAnyAuthority('CREATE_MAINTENANCE_REQUEST', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceRequestSummaryDto promoteIssue(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam Long issueReportId,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) Long technicianId) {
        return maintenanceService.createWorkOrderFromIssue(principal.getUserId(), issueReportId, priority, start, end, technicianId);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyAuthority('ASSIGN_MAINTENANCE', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceRequestSummaryDto assignTechnician(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) Long technicianId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestBody(required = false) com.labresource.backend.maintenance.dto.ManagerAssignRequestDto dto) {
        Long techId = dto != null && dto.getTechnicianId() != null ? dto.getTechnicianId() : technicianId;
        LocalDateTime startDt = dto != null && dto.getTargetStartDateTime() != null ? dto.getTargetStartDateTime() : start;
        LocalDateTime endDt = dto != null && dto.getTargetEndDateTime() != null ? dto.getTargetEndDateTime() : end;
        String problemDescription = dto != null ? dto.getProblemDescription() : null;
        String instructions = dto != null ? dto.getManagerInstructions() : null;
        return maintenanceService.assignTechnician(principal.getUserId(), id, techId, startDt, endDt, problemDescription, instructions);
    }

    @GetMapping("/{id}/eligible-technicians")
    @PreAuthorize("hasAnyAuthority('VIEW_TECHNICIAN_AVAILABILITY', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN')")
    public List<TechnicianWorkloadDto> getEligibleTechnicians(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return maintenanceService.getEligibleTechnicians(id, principal.getUserId());
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasAnyAuthority('UPDATE_MAINTENANCE', 'ROLE_LAB_TECHNICIAN', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceRequestSummaryDto startWork(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return maintenanceService.startWork(principal.getUserId(), id);
    }

    @PostMapping(value = "/{id}/complete")
    @PreAuthorize("hasAnyAuthority('COMPLETE_MAINTENANCE', 'ROLE_LAB_TECHNICIAN', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceRequestSummaryDto completeWork(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) String diagnosticNotes,
            @RequestParam(required = false) String workPerformed,
            @RequestParam(required = false) String partsUsed,
            @RequestParam(value = "completionPhoto", required = false) org.springframework.web.multipart.MultipartFile completionPhoto,
            @RequestBody(required = false) com.labresource.backend.maintenance.dto.TechnicianCompletionDto dto) {
        com.labresource.backend.maintenance.dto.TechnicianCompletionDto completionDto = dto != null ? dto : new com.labresource.backend.maintenance.dto.TechnicianCompletionDto();
        if (diagnosticNotes != null && !diagnosticNotes.isBlank()) {
            completionDto.setDiagnosticNotes(diagnosticNotes);
        }
        if (workPerformed != null && !workPerformed.isBlank()) {
            completionDto.setWorkPerformed(workPerformed);
        } else if (notes != null && !notes.isBlank() && completionDto.getWorkPerformed() == null) {
            completionDto.setWorkPerformed(notes);
        }
        if (partsUsed != null && !partsUsed.isBlank()) {
            completionDto.setPartsUsed(partsUsed);
        }
        return maintenanceService.completeWork(principal.getUserId(), id, completionDto, completionPhoto);
    }

    @PostMapping("/{id}/verify")
    @PreAuthorize("hasAnyAuthority('COMPLETE_MAINTENANCE', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceRequestSummaryDto verifyWork(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) Boolean approved,
            @RequestParam(required = false) String equipmentStatus,
            @RequestParam(required = false) String rejectionReason,
            @RequestParam(required = false) String managerNotes,
            @RequestBody(required = false) com.labresource.backend.maintenance.dto.ManagerVerifyRequestDto dto) {
        com.labresource.backend.maintenance.dto.ManagerVerifyRequestDto verifyDto = dto != null ? dto : new com.labresource.backend.maintenance.dto.ManagerVerifyRequestDto();
        if (approved != null) {
            verifyDto.setApproved(approved);
        }
        if (equipmentStatus != null) {
            verifyDto.setEquipmentStatus(equipmentStatus);
        }
        if (rejectionReason != null) {
            verifyDto.setRejectionReason(rejectionReason);
        }
        if (managerNotes != null) {
            verifyDto.setManagerNotes(managerNotes);
        }
        return maintenanceService.verifyWork(principal.getUserId(), id, verifyDto);
    }

    @GetMapping("/department")
    @PreAuthorize("hasAnyAuthority('VIEW_MAINTENANCE', 'ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public List<MaintenanceRequestSummaryDto> getDepartmentWorkOrders(@AuthenticationPrincipal UserPrincipal principal) {
        return maintenanceService.getDepartmentWorkOrders(principal.getDepartmentId(), principal.getInstitutionId());
    }

    @GetMapping("/technician")
    @PreAuthorize("hasAnyAuthority('VIEW_MAINTENANCE', 'ROLE_LAB_TECHNICIAN', 'ROLE_SYSTEM_ADMIN')")
    public List<MaintenanceRequestSummaryDto> getTechnicianTasks(@AuthenticationPrincipal UserPrincipal principal) {
        return maintenanceService.getTechnicianTasks(principal.getUserId());
    }

    @PostMapping("/{id}/submit-plan")
    @PreAuthorize("hasAnyAuthority('UPDATE_MAINTENANCE', 'ROLE_LAB_TECHNICIAN', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceRequestSummaryDto submitRepairPlan(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime proposedStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime proposedEnd,
            @RequestParam(required = false) String delayReason,
            @RequestParam(required = false) Boolean requiresParts,
            @RequestParam(required = false) String partsDetails,
            @RequestBody(required = false) com.labresource.backend.maintenance.dto.TechnicianPlanRequestDto dto) {
        LocalDateTime start = dto != null && dto.getProposedStartDateTime() != null ? dto.getProposedStartDateTime() : proposedStart;
        LocalDateTime end = dto != null && dto.getProposedEndDateTime() != null ? dto.getProposedEndDateTime() : proposedEnd;
        String reason = dto != null && dto.getDelayReason() != null ? dto.getDelayReason() : delayReason;
        Boolean reqParts = dto != null && dto.getRequiresParts() != null ? dto.getRequiresParts() : requiresParts;
        String pDetails = dto != null && dto.getPartsDetails() != null ? dto.getPartsDetails() : partsDetails;
        return maintenanceService.submitRepairPlan(principal.getUserId(), id, start, end, reason, reqParts, pDetails);
    }

    @PostMapping("/{id}/finalize-schedule")
    @PreAuthorize("hasAnyAuthority('ASSIGN_MAINTENANCE', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceRequestSummaryDto finalizeSchedule(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime finalStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime finalEnd,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) java.time.LocalDate finalDueDate,
            @RequestParam(required = false) String managerNotes,
            @RequestBody(required = false) com.labresource.backend.maintenance.dto.ManagerFinalizeRequestDto dto) {
        LocalDateTime start = dto != null && dto.getFinalStartDateTime() != null ? dto.getFinalStartDateTime() : finalStart;
        LocalDateTime end = dto != null && dto.getFinalEndDateTime() != null ? dto.getFinalEndDateTime() : finalEnd;
        String notes = dto != null && dto.getManagerNotes() != null ? dto.getManagerNotes() : managerNotes;
        return maintenanceService.finalizeSchedule(principal.getUserId(), id, start, end, finalDueDate, notes);
    }

    @PostMapping("/{id}/accept-proposal")
    @PreAuthorize("hasAnyAuthority('ASSIGN_MAINTENANCE', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN', 'ROLE_INSTITUTION_ADMIN', 'ROLE_DEPARTMENT_HEAD')")
    public MaintenanceRequestSummaryDto acceptTechnicianProposal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody(required = false) com.labresource.backend.maintenance.dto.AcceptProposalRequestDto dto) {
        String managerNotes = dto != null ? dto.getManagerNotes() : null;
        return maintenanceService.acceptTechnicianProposal(principal.getUserId(), id, managerNotes);
    }

    @PostMapping("/{id}/accept-schedule")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_TECHNICIAN', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceRequestSummaryDto acceptSchedule(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return maintenanceService.acceptSchedule(principal.getUserId(), id);
    }

    @PostMapping("/{id}/cancel-assignment")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_TECHNICIAN', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceRequestSummaryDto cancelAssignment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return maintenanceService.cancelAssignment(principal.getUserId(), id);
    }

    @PostMapping("/{id}/manager-cancel")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN', 'ROLE_INSTITUTION_ADMIN')")
    public MaintenanceRequestSummaryDto managerCancel(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String cancelReason = reason;
        if ((cancelReason == null || cancelReason.isBlank()) && body != null) {
            cancelReason = body.get("reason");
        }
        return maintenanceService.cancelByManager(principal.getUserId(), id, cancelReason);
    }

    @PostMapping("/{id}/cancel")
    public MaintenanceRequestSummaryDto cancelWorkOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String cancelReason = reason;
        if ((cancelReason == null || cancelReason.isBlank()) && body != null) {
            cancelReason = body.get("reason");
        }
        boolean isManagerOrHead = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_LAB_MANAGER") || a.getAuthority().equals("ROLE_DEPARTMENT_HEAD") || a.getAuthority().equals("ROLE_SYSTEM_ADMIN") || a.getAuthority().equals("ROLE_INSTITUTION_ADMIN"));
        if (isManagerOrHead) {
            return maintenanceService.cancelByManager(principal.getUserId(), id, cancelReason);
        } else {
            return maintenanceService.cancelAssignment(principal.getUserId(), id);
        }
    }

    @PostMapping("/{id}/remove-assignment")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN', 'ROLE_INSTITUTION_ADMIN')")
    public MaintenanceRequestSummaryDto removeAssignment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @RequestBody(required = false) com.labresource.backend.maintenance.dto.RemoveAssignmentRequestDto dto) {
        String removalReason = dto != null && dto.getReason() != null ? dto.getReason() : reason;
        return maintenanceService.removeAssignment(principal.getUserId(), id, removalReason);
    }

    @PostMapping("/{id}/reassign")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN', 'ROLE_INSTITUTION_ADMIN')")
    public MaintenanceRequestSummaryDto reassignTechnician(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody com.labresource.backend.maintenance.dto.ReassignTechnicianRequestDto dto) {
        return maintenanceService.reassignTechnician(
                principal.getUserId(),
                id,
                dto.getNewTechnicianId(),
                dto.getTargetStartDateTime(),
                dto.getTargetEndDateTime(),
                dto.getManagerInstructions(),
                dto.getReason()
        );
    }

    @PutMapping("/{id}/edit")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN', 'ROLE_INSTITUTION_ADMIN')")
    public MaintenanceRequestSummaryDto editMaintenance(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody com.labresource.backend.maintenance.dto.MaintenanceEditDto dto) {
        return maintenanceService.editMaintenance(principal.getUserId(), id, dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_MANAGER', 'ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN', 'ROLE_INSTITUTION_ADMIN')")
    public MaintenanceRequestSummaryDto updateMaintenance(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody com.labresource.backend.maintenance.dto.MaintenanceEditDto dto) {
        return maintenanceService.editMaintenance(principal.getUserId(), id, dto);
    }

    // ── MaintenanceRecord Operations ──────────────────────────────────────────

    @PostMapping("/records")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_TECHNICIAN', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN')")
    public com.labresource.backend.maintenance.dto.MaintenanceRecordDto createRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam Long equipmentId,
            @RequestParam(required = false) Long technicianId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long issueReportId) {
        Long techId = technicianId != null ? technicianId : principal.getUserId();
        return maintenanceService.createMaintenanceRecord(equipmentId, techId, type, priority, reason, description, issueReportId);
    }

    @PutMapping("/records/{id}/start")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_TECHNICIAN', 'ROLE_SYSTEM_ADMIN')")
    public com.labresource.backend.maintenance.dto.MaintenanceRecordDto startRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return maintenanceService.startMaintenanceRecord(id, principal.getUserId());
    }

    @PutMapping("/records/{id}/complete")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_TECHNICIAN', 'ROLE_SYSTEM_ADMIN')")
    public com.labresource.backend.maintenance.dto.MaintenanceRecordDto completeRecord(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam(required = false) java.math.BigDecimal partsCost,
            @RequestParam(required = false) java.math.BigDecimal labourCost,
            @RequestParam(required = false) String workPerformed,
            @RequestParam(required = false) String partsUsed,
            @RequestParam(required = false) String conditionAfter,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) java.time.LocalDate nextMaintenanceDate) {
        return maintenanceService.completeMaintenanceRecord(id, partsCost, labourCost, workPerformed, partsUsed, conditionAfter, nextMaintenanceDate);
    }

    @GetMapping("/records/history")
    public List<com.labresource.backend.maintenance.dto.MaintenanceRecordDto> getHistory(@RequestParam Long equipmentId) {
        return maintenanceService.getMaintenanceHistory(equipmentId);
    }
}
