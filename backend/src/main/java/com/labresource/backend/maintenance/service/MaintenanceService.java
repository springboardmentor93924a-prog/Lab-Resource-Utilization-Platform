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
            assignTechnicianInternal(userId, saved, technicianId, start, end);
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
    public MaintenanceRequestSummaryDto assignTechnician(Long userId, Long maintenanceId, Long technicianId, LocalDateTime start, LocalDateTime end) {
        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        assignTechnicianInternal(userId, mr, technicianId, start, end);
        MaintenanceRequest saved = maintenanceRequestRepository.save(mr);

        Equipment eq = equipmentRepository.findById(saved.getEquipmentId()).orElse(null);
        String eqName = eq != null ? eq.getName() : "Unknown Equipment";

        return MaintenanceRequestSummaryDto.fromEntity(saved, eqName);
    }

    private void assignTechnicianInternal(Long assignerId, MaintenanceRequest mr, Long technicianId, LocalDateTime start, LocalDateTime end) {
        Equipment equipment = equipmentRepository.findById(mr.getEquipmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));

        AppUser tech = appUserRepository.findById(technicianId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Technician not found."));

        // Validate department
        if (!equipment.getDepartmentId().equals(tech.getDepartmentId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Technician does not belong to the equipment's department.");
        }

        // Validate schedule and unavailability
        if (start != null && end != null) {
            if (!end.isAfter(start)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "End datetime must be after start datetime.");
            }
            mr.setScheduledStartDatetime(start);
            mr.setScheduledEndDatetime(end);
            mr.setScheduledDate(start.toLocalDate());

            // Check exact overlap
            List<TechnicianUnavailability> overlaps = unavailabilityRepository.findOverlappingActive(technicianId, start, end);
            if (!overlaps.isEmpty()) {
                throw new ApiException(HttpStatus.CONFLICT, "Technician is unavailable during the scheduled time window.");
            }
        } else if (mr.getScheduledStartDatetime() != null && mr.getScheduledEndDatetime() != null) {
            // Check overlap with existing schedule
            List<TechnicianUnavailability> overlaps = unavailabilityRepository.findOverlappingActive(technicianId, mr.getScheduledStartDatetime(), mr.getScheduledEndDatetime());
            if (!overlaps.isEmpty()) {
                throw new ApiException(HttpStatus.CONFLICT, "Technician is unavailable during the scheduled time window.");
            }
        } else if (mr.getScheduledDate() != null) {
            // Fallback: check full day
            LocalDateTime dayStart = mr.getScheduledDate().atStartOfDay();
            LocalDateTime dayEnd = mr.getScheduledDate().atTime(LocalTime.MAX);
            List<TechnicianUnavailability> overlaps = unavailabilityRepository.findOverlappingActive(technicianId, dayStart, dayEnd);
            if (!overlaps.isEmpty()) {
                throw new ApiException(HttpStatus.CONFLICT, "Technician is unavailable on the scheduled date.");
            }
        } else {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Technician cannot be assigned without a schedule date or time window.");
        }

        // Handle re-assignment/rework or new assignment
        if (MaintenanceRequest.REJECTED.equals(mr.getStatus())) {
            // Cancel/Reject previous assignment to clear workload
            List<MaintenanceAssignment> activeAssignments = assignmentRepository.findByTechnicianIdAndStatus(mr.getAssignedTechnicianId(), "ASSIGNED");
            for (MaintenanceAssignment ma : activeAssignments) {
                if (ma.getMaintenanceId().equals(mr.getMaintenanceId())) {
                    ma.setStatus("REJECTED");
                    ma.setCompletedAt(LocalDateTime.now());
                    assignmentRepository.save(ma);
                }
            }
        }

        MaintenanceAssignment newAssignment = new MaintenanceAssignment();
        newAssignment.setMaintenanceId(mr.getMaintenanceId());
        newAssignment.setTechnicianId(technicianId);
        newAssignment.setAssignedBy(assignerId);
        newAssignment.setStatus("ASSIGNED");
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

        if (!MaintenanceRequest.ASSIGNED.equals(mr.getStatus()) && !MaintenanceRequest.REJECTED.equals(mr.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Work order must be ASSIGNED or REJECTED to start work.");
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
        assignmentRepository.findAll().stream()
                .filter(a -> a.getMaintenanceId().equals(maintenanceId) && a.getTechnicianId().equals(userId) && "ASSIGNED".equals(a.getStatus()))
                .findFirst()
                .ifPresent(a -> {
                    a.setStatus("IN_PROGRESS");
                    a.setStartedAt(LocalDateTime.now());
                    assignmentRepository.save(a);
                });

        Equipment eq = equipmentRepository.findById(mr.getEquipmentId()).orElse(null);
        String eqName = eq != null ? eq.getName() : "Unknown Equipment";

        return MaintenanceRequestSummaryDto.fromEntity(mr, eqName);
    }

    @Transactional
    public MaintenanceRequestSummaryDto completeWork(Long userId, Long maintenanceId, String notes) {
        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        if (!MaintenanceRequest.IN_PROGRESS.equals(mr.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Work order must be IN_PROGRESS to complete work.");
        }

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
                    a.setNotes(notes);
                    assignmentRepository.save(a);
                });

        // Save a maintenance log
        MaintenanceLog log = new MaintenanceLog();
        log.setMaintenanceId(mr.getMaintenanceId());
        log.setTechnicianId(userId);
        log.setActionTaken(notes != null && !notes.isBlank() ? notes : "Technician submitted work for verification.");
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

        return MaintenanceRequestSummaryDto.fromEntity(mr, eqName);
    }

    @Transactional
    public MaintenanceRequestSummaryDto verifyWork(Long userId, Long maintenanceId, boolean approved, String equipmentStatus) {
        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        if (!MaintenanceRequest.PENDING_VERIFICATION.equals(mr.getStatus())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Work order must be PENDING_VERIFICATION to verify work.");
        }

        Equipment equipment = equipmentRepository.findById(mr.getEquipmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));

        if (approved) {
            mr.setStatus(MaintenanceRequest.COMPLETED);
            if (equipmentStatus == null || (!Equipment.AVAILABLE.equals(equipmentStatus) && !Equipment.OUT_OF_SERVICE.equals(equipmentStatus))) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Resulting equipment status must be AVAILABLE or OUT_OF_SERVICE.");
            }
            equipment.setStatus(equipmentStatus);
            equipmentRepository.save(equipment);

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
            mr.setStatus(MaintenanceRequest.REJECTED);
            // Equipment cannot become AVAILABLE
            if (Equipment.AVAILABLE.equals(equipmentStatus)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Equipment cannot be set to AVAILABLE when verification is rejected.");
            }
            if (equipmentStatus != null && !equipmentStatus.isBlank()) {
                equipment.setStatus(equipmentStatus);
            } else {
                equipment.setStatus(Equipment.UNDER_MAINTENANCE);
            }
            equipmentRepository.save(equipment);

            // Find COMPLETED assignment and transition to REJECTED
            assignmentRepository.findAll().stream()
                    .filter(a -> a.getMaintenanceId().equals(maintenanceId) && a.getTechnicianId().equals(mr.getAssignedTechnicianId()) && "COMPLETED".equals(a.getStatus()))
                    .findFirst()
                    .ifPresent(a -> {
                        a.setStatus("REJECTED");
                        assignmentRepository.save(a);
                    });

            if (mr.getAssignedTechnicianId() != null) {
                notificationService.notifyUser(
                        mr.getAssignedTechnicianId(),
                        "MAINTENANCE_REJECTED",
                        "Work Order Rejected",
                        "Your work on work order " + mr.getMaintenanceCode() + " has been rejected by the manager."
                );
            }
        }

        maintenanceRequestRepository.save(mr);

        return MaintenanceRequestSummaryDto.fromEntity(mr, equipment.getName());
    }

    public List<TechnicianWorkloadDto> getEligibleTechnicians(Long maintenanceId) {
        MaintenanceRequest mr = maintenanceRequestRepository.findById(maintenanceId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Work order not found."));

        Equipment equipment = equipmentRepository.findById(mr.getEquipmentId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));

        List<AppUser> technicians = appUserRepository.findByRoleNameAndDepartmentId(Role.LAB_TECHNICIAN, equipment.getDepartmentId());
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
                available = false; // Block if no schedule set
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
        return maintenanceRequestRepository.findByRequestedByOrderByCreatedAtDesc(userId).stream()
                .map(m -> MaintenanceRequestSummaryDto.fromEntity(m, equipmentService.getEntity(m.getEquipmentId()).getName()))
                .toList();
    }

    public List<MaintenanceRequestSummaryDto> getDepartmentWorkOrders(Long departmentId) {
        return maintenanceRequestRepository.findByDepartmentIdOrderByCreatedAtDesc(departmentId).stream()
                .map(m -> MaintenanceRequestSummaryDto.fromEntity(m, equipmentRepository.findById(m.getEquipmentId()).map(Equipment::getName).orElse("Unknown Equipment")))
                .toList();
    }

    public List<MaintenanceRequestSummaryDto> getTechnicianTasks(Long technicianId) {
        return maintenanceRequestRepository.findByAssignedTechnicianId(technicianId).stream()
                .map(m -> MaintenanceRequestSummaryDto.fromEntity(m, equipmentRepository.findById(m.getEquipmentId()).map(Equipment::getName).orElse("Unknown Equipment")))
                .toList();
    }
}
