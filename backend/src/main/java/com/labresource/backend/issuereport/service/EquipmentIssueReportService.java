package com.labresource.backend.issuereport.service;

import com.labresource.backend.booking.entity.Booking;
import com.labresource.backend.booking.repository.BookingRepository;
import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.issuereport.dto.EligibleBookingDto;
import com.labresource.backend.issuereport.dto.IssueReportRequestDto;
import com.labresource.backend.issuereport.entity.EquipmentIssueReport;
import com.labresource.backend.issuereport.repository.EquipmentIssueReportRepository;
import com.labresource.backend.notification.service.NotificationService;
import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class EquipmentIssueReportService {

    private final EquipmentIssueReportRepository issueReportRepository;
    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final NotificationService notificationService;
    private final com.labresource.backend.billing.repository.CostRecordRepository costRecordRepository;
    private final AppUserRepository appUserRepository;
    private final com.labresource.backend.maintenance.repository.MaintenanceRequestRepository maintenanceRequestRepository;
    private final com.labresource.backend.department.repository.DepartmentRepository departmentRepository;
    private final com.labresource.backend.laboratory.repository.LaboratoryRepository laboratoryRepository;

    public List<EligibleBookingDto> getEligibleBookings(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> bookings = bookingRepository.findActiveInUseBookingsForUser(userId, now);

        return bookings.stream().map(b -> {
            Equipment eq = equipmentRepository.findById(b.getEquipmentId()).orElse(null);
            String eqName = eq != null ? eq.getName() : "Unknown Equipment";
            String category = eq != null ? eq.getCategory() : "";
            String location = eq != null ? eq.getLocation() : "";
            String serialNumber = eq != null ? eq.getSerialNumber() : "";
            Long deptId = eq != null ? eq.getDepartmentId() : null;
            String deptName = "";
            if (deptId != null) {
                deptName = departmentRepository.findById(deptId).map(d -> d.getName()).orElse("");
            }
            Long labId = eq != null ? eq.getLabId() : null;
            String labName = "";
            if (labId != null) {
                labName = laboratoryRepository.findById(labId).map(l -> l.getName()).orElse("");
            }

            EligibleBookingDto dto = new EligibleBookingDto(
                    b.getBookingId(),
                    b.getEquipmentId(),
                    eqName,
                    category,
                    location,
                    b.getStartTime(),
                    b.getEndTime()
            );
            dto.setSerialNumber(serialNumber);
            dto.setDepartmentId(deptId);
            dto.setDepartmentName(deptName);
            dto.setLabId(labId);
            dto.setLabName(labName);
            dto.setStatus(b.getStatus());
            return dto;
        }).toList();
    }

    @Transactional
    public EquipmentIssueReport reportIssue(Long userId, IssueReportRequestDto dto) {
        AppUser reporter = appUserRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));

        boolean isLabManager = reporter.getRoles().stream()
                .anyMatch(r -> "LAB_MANAGER".equals(r.getRoleName()) || "ROLE_LAB_MANAGER".equals(r.getRoleName()) || "SYSTEM_ADMIN".equals(r.getRoleName()));

        Equipment equipment;
        Long bookingId = null;

        if (dto.getBookingId() != null) {
            Booking booking = bookingRepository.findById(dto.getBookingId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found."));

            if (!isLabManager) {
                if (!booking.getUserId().equals(userId)) {
                    throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to report an issue for another user's booking.");
                }

                if (!Booking.IN_USE.equals(booking.getStatus())) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Issue reports can only be submitted for bookings that are currently IN_USE.");
                }

                LocalDateTime now = LocalDateTime.now();
                if (now.isBefore(booking.getStartTime()) || !now.isBefore(booking.getEndTime())) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Issue reports can only be submitted during the active booking time window.");
                }

                if (dto.getEquipmentId() != null && !dto.getEquipmentId().equals(booking.getEquipmentId())) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, "Equipment ID does not match the active booking equipment.");
                }
            }

            equipment = equipmentRepository.findById(booking.getEquipmentId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));
            bookingId = booking.getBookingId();
        } else {
            if (!isLabManager) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Researchers/Students can only report issues for valid equipment they have booked.");
            }
            if (dto.getEquipmentId() == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Equipment ID is required when reporting an issue.");
            }
            equipment = equipmentRepository.findById(dto.getEquipmentId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Equipment not found."));
        }

        if (dto.getIncidentTimestamp() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Incident date and time is required.");
        }
        if (!Boolean.TRUE.equals(dto.getDamageAcknowledged())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Damage acknowledgment confirmation is required.");
        }
        if (dto.getDescription() == null || dto.getDescription().trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Problem description is required.");
        }
        if (dto.getIssueType() == null || dto.getIssueType().trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Issue type is required.");
        }

        String mainRole = reporter.getRoles().stream()
                .findFirst()
                .map(r -> r.getRoleName())
                .orElse("USER");

        EquipmentIssueReport report = new EquipmentIssueReport();
        report.setEquipmentId(equipment.getEquipmentId());
        report.setBookingId(bookingId);
        report.setReportedBy(userId);
        report.setReportedAt(LocalDateTime.now());
        report.setReporterRole(mainRole);
        report.setInstitutionId(equipment.getInstitutionId());
        report.setDepartmentId(equipment.getDepartmentId());
        report.setIssueType(dto.getIssueType());
        report.setIssueDescription(dto.getDescription().trim());
        report.setPriority(dto.getPriority() != null ? dto.getPriority().toUpperCase() : "MEDIUM");
        report.setAttachmentSecureUrl(dto.getAttachmentUrl());
        report.setIncidentTimestamp(dto.getIncidentTimestamp());
        report.setDamageAcknowledged(Boolean.TRUE.equals(dto.getDamageAcknowledged()));
        report.setStatus("OPEN");

        EquipmentIssueReport saved = issueReportRepository.save(report);

        // Automatically create linked MaintenanceRequest
        com.labresource.backend.maintenance.entity.MaintenanceRequest mr = new com.labresource.backend.maintenance.entity.MaintenanceRequest();
        mr.setEquipmentId(equipment.getEquipmentId());
        mr.setRequestedBy(userId);
        mr.setDepartmentId(equipment.getDepartmentId());
        mr.setIssueReportId(saved.getIssueReportId());
        mr.setIssueType(dto.getIssueType());
        mr.setIssueDescription(dto.getDescription());
        mr.setPriority(dto.getPriority() != null ? dto.getPriority().toUpperCase() : "MEDIUM");
        mr.setAttachmentSecureUrl(dto.getAttachmentUrl());
        mr.setStatus(com.labresource.backend.maintenance.entity.MaintenanceRequest.OPEN);

        com.labresource.backend.maintenance.entity.MaintenanceRequest savedMr = maintenanceRequestRepository.save(mr);
        savedMr.setMaintenanceCode(String.format("MR-%d-%05d", java.time.Year.now().getValue(), savedMr.getMaintenanceId()));
        savedMr = maintenanceRequestRepository.save(savedMr);

        saved.setMaintenanceId(savedMr.getMaintenanceId());
        saved = issueReportRepository.save(saved);

        // Notify managers
        notificationService.notifyDepartmentLabManagers(
                equipment.getDepartmentId(),
                "EQUIPMENT_ISSUE_REPORTED",
                "New issue reported: " + equipment.getName(),
                "A new issue was reported for \"" + equipment.getName() + "\" by user ID: " + userId
        );

        return saved;
    }

    public List<EquipmentIssueReport> myReports(Long userId) {
        return issueReportRepository.findByReportedByOrderByCreatedAtDesc(userId);
    }

    public List<EquipmentIssueReport> getDepartmentIssues(Long departmentId, String status) {
        if (status == null || status.isBlank()) {
            return issueReportRepository.findByDepartmentIdOrderByCreatedAtDesc(departmentId);
        }
        return issueReportRepository.findByDepartmentIdAndStatusOrderByCreatedAtDesc(departmentId, status.toUpperCase());
    }

    @Transactional
    public EquipmentIssueReport assignTechnician(Long issueId, Long technicianId) {
        EquipmentIssueReport report = issueReportRepository.findById(issueId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Issue report not found."));

        report.setStatus("ASSIGNED");
        report.setAssignedTechnicianId(technicianId);
        return issueReportRepository.save(report);
    }

    @Transactional
    public EquipmentIssueReport resolveIssue(Long issueId) {
        EquipmentIssueReport report = issueReportRepository.findById(issueId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Issue report not found."));

        report.setStatus("RESOLVED");
        report.setResolvedAt(LocalDateTime.now());
        EquipmentIssueReport saved = issueReportRepository.save(report);

        // NOTE: Equipment status is NOT reset here. Equipment status transitions
        // (UNDER_MAINTENANCE → AVAILABLE / OUT_OF_SERVICE) are controlled exclusively
        // by the Lab Manager during work order verification (MaintenanceService.verifyWork).

        // Notify reporter
        notificationService.notifyUser(report.getReportedBy(), "ISSUE_RESOLVED", "Issue Resolved",
                "Your reported issue for equipment has been resolved.");

        return saved;
    }

    public EquipmentIssueReport getIssueReportDetails(Long userId, Long issueId) {
        EquipmentIssueReport report = issueReportRepository.findById(issueId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Issue report not found."));

        if (!report.getReportedBy().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This issue report does not belong to you.");
        }
        return report;
    }

    public byte[] downloadIssueReportPdf(Long userId, Long issueId,
                                        com.labresource.backend.common.service.ReceiptPdfGeneratorService pdfGenerator,
                                        com.labresource.backend.auth.repository.AppUserRepository appUserRepository,
                                        com.labresource.backend.department.repository.DepartmentRepository departmentRepository) {
        EquipmentIssueReport report = getIssueReportDetails(userId, issueId);
        Booking booking = bookingRepository.findById(report.getBookingId()).orElse(null);
        Equipment equipment = equipmentRepository.findById(report.getEquipmentId()).orElse(null);
        com.labresource.backend.auth.entity.AppUser user = appUserRepository.findById(userId).orElse(null);
        com.labresource.backend.department.entity.Department department = equipment != null ? departmentRepository.findById(equipment.getDepartmentId()).orElse(null) : null;

        return pdfGenerator.generateIssueReportReceiptPdf(report, booking, equipment, user, department);
    }

    // ── Inspection & Damage Liability Operations (Phase 6) ───────────────────

    @Transactional
    public EquipmentIssueReport inspectIssue(Long issueId, Long technicianId, String conditionBefore, String observedProblem, java.math.BigDecimal estimatedCost, String recommendedAction, String notes) {
        EquipmentIssueReport report = issueReportRepository.findById(issueId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Issue report not found."));

        report.setAssignedTechnicianId(technicianId);
        report.setConditionBefore(conditionBefore);
        report.setObservedProblem(observedProblem);
        report.setEstimatedRepairCost(estimatedCost != null && estimatedCost.compareTo(java.math.BigDecimal.ZERO) >= 0 ? estimatedCost : java.math.BigDecimal.ZERO);
        report.setRecommendedAction(recommendedAction);
        report.setInspectionNotes(notes);
        report.setStatus("UNDER_INSPECTION");

        return issueReportRepository.save(report);
    }

    @Transactional
    public EquipmentIssueReport decideLiability(Long issueId, Long adminUserId, String liabilityType, java.math.BigDecimal studentAmount) {
        EquipmentIssueReport report = issueReportRepository.findById(issueId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Issue report not found."));

        if (!"INSTITUTION".equalsIgnoreCase(liabilityType) && !"STUDENT".equalsIgnoreCase(liabilityType)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Liability type must be either INSTITUTION or STUDENT.");
        }

        report.setLiabilityType(liabilityType.toUpperCase());
        report.setLiabilityDecidedBy(adminUserId);
        report.setLiabilityDecidedAt(LocalDateTime.now());

        if ("STUDENT".equalsIgnoreCase(liabilityType)) {
            java.math.BigDecimal chargeAmount = studentAmount != null && studentAmount.compareTo(java.math.BigDecimal.ZERO) > 0
                    ? studentAmount : (report.getEstimatedRepairCost() != null ? report.getEstimatedRepairCost() : java.math.BigDecimal.ZERO);

            report.setStudentLiabilityAmount(chargeAmount);

            Equipment eq = equipmentRepository.findById(report.getEquipmentId()).orElse(null);
            if (eq != null && chargeAmount.compareTo(java.math.BigDecimal.ZERO) > 0) {
                // Create DAMAGE_CHARGE CostRecord (Student Receivable — does NOT increment department budget used_amount!)
                com.labresource.backend.billing.entity.CostRecord charge = new com.labresource.backend.billing.entity.CostRecord();
                charge.setEquipmentId(eq.getEquipmentId());
                charge.setDepartmentId(eq.getDepartmentId());
                charge.setInstitutionId(eq.getInstitutionId());
                charge.setBookingId(report.getBookingId());
                charge.setCostType("DAMAGE_CHARGE"); // Student Receivable
                charge.setAmount(chargeAmount);
                charge.setCurrency("INR");
                charge.setBillingPeriod(com.labresource.backend.budget.util.FiscalYearUtil.getCurrentFiscalYear());
                costRecordRepository.save(charge);

                // Alert student
                notificationService.notifyUser(
                        report.getReportedBy(),
                        "DAMAGE_CHARGE_ISSUED",
                        "Damage Liability Notice",
                        "A damage liability charge of INR " + chargeAmount + " has been registered for equipment incident #" + issueId + "."
                );
            }
        } else {
            report.setStudentLiabilityAmount(java.math.BigDecimal.ZERO);
            notificationService.notifyUser(
                    report.getReportedBy(),
                    "LIABILITY_DECISION_INSTITUTION",
                    "Damage Liability Cleared",
                    "The equipment fault for incident #" + issueId + " has been determined as normal wear/institution liability. No charge applies."
            );
        }

        return issueReportRepository.save(report);
    }
}

