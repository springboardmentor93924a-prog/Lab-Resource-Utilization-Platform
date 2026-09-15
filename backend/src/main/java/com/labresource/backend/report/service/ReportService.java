package com.labresource.backend.report.service;

import com.labresource.backend.common.exception.ApiException;
import com.labresource.backend.report.entity.Report;
import com.labresource.backend.report.repository.ReportRepository;
import com.labresource.backend.storage.CloudinaryUploadResult;
import com.labresource.backend.storage.StorageService;
import com.labresource.backend.report.dto.*;
import com.labresource.backend.booking.entity.Booking;
import com.labresource.backend.booking.repository.BookingRepository;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.utilization.entity.UtilizationMetric;
import com.labresource.backend.utilization.repository.UtilizationMetricRepository;
import com.labresource.backend.utilization.entity.UtilizationLog;
import com.labresource.backend.utilization.repository.UtilizationLogRepository;
import com.labresource.backend.maintenance.entity.MaintenanceRequest;
import com.labresource.backend.maintenance.repository.MaintenanceRequestRepository;
import com.labresource.backend.issuereport.entity.EquipmentIssueReport;
import com.labresource.backend.issuereport.repository.EquipmentIssueReportRepository;
import com.labresource.backend.calibration.entity.EquipmentCalibration;
import com.labresource.backend.calibration.repository.EquipmentCalibrationRepository;
import com.labresource.backend.certification.entity.EquipmentCertification;
import com.labresource.backend.certification.repository.EquipmentCertificationRepository;
import com.labresource.backend.sharing.entity.SharedBooking;
import com.labresource.backend.sharing.repository.SharedBookingRepository;
import com.labresource.backend.sharing.entity.SharingAgreement;
import com.labresource.backend.sharing.repository.SharingAgreementRepository;
import com.labresource.backend.sharing.entity.ResourceSharingRequest;
import com.labresource.backend.sharing.repository.ResourceSharingRequestRepository;
import com.labresource.backend.billing.entity.Invoice;
import com.labresource.backend.billing.repository.InvoiceRepository;
import com.labresource.backend.billing.entity.CostRecord;
import com.labresource.backend.billing.repository.CostRecordRepository;
import com.labresource.backend.budget.entity.Budget;
import com.labresource.backend.budget.repository.BudgetRepository;
import com.labresource.backend.budget.util.FiscalYearUtil;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.laboratory.entity.Laboratory;
import com.labresource.backend.laboratory.repository.LaboratoryRepository;
import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.equipment.entity.EquipmentOperatingSchedule;
import com.labresource.backend.equipment.repository.EquipmentOperatingScheduleRepository;
import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.role.entity.Role;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final StorageService storageService;

    // Repositories for dynamic reports
    private final EquipmentRepository equipmentRepository;
    private final DepartmentRepository departmentRepository;
    private final BookingRepository bookingRepository;
    private final UtilizationMetricRepository utilizationMetricRepository;
    private final UtilizationLogRepository utilizationLogRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final EquipmentIssueReportRepository issueReportRepository;
    private final EquipmentCalibrationRepository calibrationRepository;
    private final EquipmentCertificationRepository certificationRepository;
    private final SharedBookingRepository sharedBookingRepository;
    private final SharingAgreementRepository sharingAgreementRepository;
    private final ResourceSharingRequestRepository resourceSharingRequestRepository;
    private final InvoiceRepository invoiceRepository;
    private final InstitutionRepository institutionRepository;
    private final AppUserRepository appUserRepository;
    private final EquipmentOperatingScheduleRepository scheduleRepository;
    // Milestone 3 — Phase 1 additional repositories
    private final CostRecordRepository costRecordRepository;
    private final BudgetRepository budgetRepository;
    private final LaboratoryRepository laboratoryRepository;


    // ─── Active Preservation of Old Endpoint Logic ──────────────────────

    @Deprecated
    @Transactional
    public Report generateReport(Long userId, Long institutionId, Long departmentId, String reportType, String format) throws IOException {
        throw new ApiException(HttpStatus.NOT_IMPLEMENTED, "Report generation/export is deprecated and not implemented in this phase. Use real analytics endpoints.");
    }

    public List<Report> getReports(UserPrincipal principal, Long filterDepartmentId) {
        List<String> roles = principal.getRoleNames();
        Long userInstId = principal.getInstitutionId();
        Long userDeptId = principal.getDepartmentId();

        if (roles.contains(Role.SYSTEM_ADMIN) || roles.contains("ROLE_SYSTEM_ADMIN")) {
            if (filterDepartmentId != null) {
                return reportRepository.findByDepartmentIdOrderByGeneratedAtDesc(filterDepartmentId);
            }
            return reportRepository.findAllByOrderByGeneratedAtDesc();
        } else if (roles.contains(Role.INSTITUTION_ADMIN) || roles.contains("ROLE_INSTITUTION_ADMIN")) {
            if (filterDepartmentId != null) {
                Department dept = departmentRepository.findById(filterDepartmentId)
                        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Department not found."));
                if (!userInstId.equals(dept.getInstitutionId())) {
                    throw new ApiException(HttpStatus.FORBIDDEN, "Access denied. Department does not belong to your institution.");
                }
                return reportRepository.findByDepartmentIdOrderByGeneratedAtDesc(filterDepartmentId);
            }
            return reportRepository.findByInstitutionIdOrderByGeneratedAtDesc(userInstId);
        } else {
            // Department Head / Lab Manager / Lab Technician
            if (userDeptId == null) {
                return Collections.emptyList();
            }
            return reportRepository.findByDepartmentIdOrderByGeneratedAtDesc(userDeptId);
        }
    }

    // ─── Dynamic Reports Core Implementations ───────────────────────────

    private void validateDates(LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "From date cannot be after to date.");
        }
    }

    private List<Equipment> getAuthorizedEquipment(UserPrincipal principal, Long filterDepartmentId) {
        List<String> roles = principal.getRoleNames();
        Long userDeptId = principal.getDepartmentId();
        Long userInstId = principal.getInstitutionId();

        if (roles.contains(Role.SYSTEM_ADMIN)) {
            if (filterDepartmentId != null) {
                return equipmentRepository.findByDepartmentId(filterDepartmentId);
            }
            return equipmentRepository.findAll();
        } else if (roles.contains(Role.INSTITUTION_ADMIN)) {
            List<Equipment> instEq = equipmentRepository.findByInstitutionId(userInstId);
            if (filterDepartmentId != null) {
                return instEq.stream()
                        .filter(e -> filterDepartmentId.equals(e.getDepartmentId()))
                        .toList();
            }
            return instEq;
        } else if (roles.contains(Role.DEPARTMENT_HEAD) || roles.contains(Role.LAB_MANAGER) || roles.contains(Role.LAB_TECHNICIAN) ||
                   roles.contains("DEPARTMENT_HEAD") || roles.contains("LAB_MANAGER") || roles.contains("LAB_TECHNICIAN")) {
            // Hard limit to user's registered department ID & institution ID
            if (userDeptId == null || userInstId == null) {
                return java.util.Collections.emptyList();
            }
            return equipmentRepository.findByDepartmentIdAndInstitutionId(userDeptId, userInstId);
        }

        return Collections.emptyList();
    }

    // ─── 1. EQUIPMENT UTILIZATION REPORT ─────────────────────────────────

    public List<EquipmentUtilizationReportDTO> getEquipmentUtilizationReport(
            UserPrincipal principal, LocalDate from, LocalDate to, Long filterDepartmentId, Long filterEquipmentId) {
        
        validateDates(from, to);
        LocalDate actualFrom = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate actualTo = to != null ? to : LocalDate.now();

        List<Equipment> authorized = getAuthorizedEquipment(principal, filterDepartmentId);
        if (filterEquipmentId != null) {
            authorized = authorized.stream()
                    .filter(e -> filterEquipmentId.equals(e.getEquipmentId()))
                    .toList();
        }

        if (authorized.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> eqIds = authorized.stream().map(Equipment::getEquipmentId).toList();

        // 1. Fetch metrics from start date through yesterday
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDate metricEnd = actualTo.isBefore(LocalDate.now()) ? actualTo : yesterday;

        List<UtilizationMetric> metrics = Collections.emptyList();
        if (!actualFrom.isAfter(metricEnd)) {
            metrics = utilizationMetricRepository.findByEquipmentIdInAndPeriodDateBetween(eqIds, actualFrom, metricEnd);
        }
        Map<Long, List<UtilizationMetric>> metricsByEq = metrics.stream()
                .collect(Collectors.groupingBy(UtilizationMetric::getEquipmentId));

        // 2. Fetch live logs for today if the date range covers today
        boolean includesToday = !actualTo.isBefore(LocalDate.now());
        Map<Long, List<UtilizationLog>> todayLogsByEq = Collections.emptyMap();
        Map<Long, List<EquipmentOperatingSchedule>> schedulesByEq = Collections.emptyMap();

        if (includesToday) {
            LocalDateTime todayStart = LocalDate.now().atStartOfDay();
            List<UtilizationLog> todayLogs = utilizationLogRepository
                    .findByEquipmentIdInAndUsageStartTimeAfter(eqIds, todayStart);
            todayLogsByEq = todayLogs.stream().collect(Collectors.groupingBy(UtilizationLog::getEquipmentId));

            int todayDOW = LocalDate.now().getDayOfWeek().getValue();
            List<EquipmentOperatingSchedule> schedules = new ArrayList<>();
            for (Long eqId : eqIds) {
                scheduleRepository.findByEquipmentIdAndDayOfWeek(eqId, todayDOW).ifPresent(schedules::add);
            }
            schedulesByEq = schedules.stream().collect(Collectors.groupingBy(EquipmentOperatingSchedule::getEquipmentId));
        }

        // 3. Fetch Bookings in date range
        LocalDateTime startDt = actualFrom.atStartOfDay();
        LocalDateTime endDt = actualTo.atTime(23, 59, 59);
        List<Booking> bookings = bookingRepository.findByEquipmentIdInAndStartTimeBetween(eqIds, startDt, endDt);
        Map<Long, List<Booking>> bookingsByEq = bookings.stream()
                .collect(Collectors.groupingBy(Booking::getEquipmentId));

        // Get Departments Map
        Map<Long, String> deptNames = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(Department::getDepartmentId, Department::getName, (a, b) -> a));

        List<EquipmentUtilizationReportDTO> report = new ArrayList<>();

        for (Equipment eq : authorized) {
            Long eqId = eq.getEquipmentId();

            // Calculate Available and Utilized Hours from metrics
            BigDecimal histAvailable = BigDecimal.ZERO;
            BigDecimal histUtilized = BigDecimal.ZERO;
            BigDecimal histIdle = BigDecimal.ZERO;

            List<UtilizationMetric> eqMetrics = metricsByEq.getOrDefault(eqId, Collections.emptyList());
            for (UtilizationMetric m : eqMetrics) {
                histAvailable = histAvailable.add(m.getTotalAvailableHours() != null ? m.getTotalAvailableHours() : BigDecimal.ZERO);
                histUtilized = histUtilized.add(m.getTotalUsedHours() != null ? m.getTotalUsedHours() : BigDecimal.ZERO);
                histIdle = histIdle.add(m.getIdleTimeHours() != null ? m.getIdleTimeHours() : BigDecimal.ZERO);
            }

            // Calculate live available and utilized hours for today
            BigDecimal todayAvailable = BigDecimal.ZERO;
            BigDecimal todayUtilized = BigDecimal.ZERO;

            if (includesToday) {
                List<EquipmentOperatingSchedule> eqScheds = schedulesByEq.getOrDefault(eqId, Collections.emptyList());
                double schedHours = 8.0; // fallback default
                if (!eqScheds.isEmpty()) {
                    EquipmentOperatingSchedule sched = eqScheds.get(0);
                    if (Boolean.TRUE.equals(sched.getIsAvailable()) && sched.getOpenTime() != null && sched.getCloseTime() != null) {
                        schedHours = (double) Duration.between(sched.getOpenTime(), sched.getCloseTime()).toMinutes() / 60.0;
                    } else if (Boolean.FALSE.equals(sched.getIsAvailable())) {
                        schedHours = 0.0;
                    }
                }
                todayAvailable = BigDecimal.valueOf(schedHours).setScale(2, RoundingMode.HALF_UP);

                List<UtilizationLog> eqTodayLogs = todayLogsByEq.getOrDefault(eqId, Collections.emptyList());
                double liveUsedMinutes = eqTodayLogs.stream()
                        .mapToDouble(l -> l.getDurationMinutes() != null ? l.getDurationMinutes() : 0)
                        .sum();
                todayUtilized = BigDecimal.valueOf(liveUsedMinutes / 60.0).setScale(2, RoundingMode.HALF_UP);
            }

            BigDecimal totalAvail = histAvailable.add(todayAvailable);
            BigDecimal totalUtil = histUtilized.add(todayUtilized);
            BigDecimal totalIdle = histIdle.add(totalAvail.subtract(totalUtil).max(BigDecimal.ZERO));

            BigDecimal utilPct = BigDecimal.ZERO;
            if (totalAvail.compareTo(BigDecimal.ZERO) > 0) {
                utilPct = totalUtil.multiply(BigDecimal.valueOf(100)).divide(totalAvail, 2, RoundingMode.HALF_UP);
            }

            // Booking stats
            List<Booking> eqBookings = bookingsByEq.getOrDefault(eqId, Collections.emptyList());
            long totalB = eqBookings.size();
            long completedB = eqBookings.stream().filter(b -> Booking.COMPLETED.equals(b.getStatus())).count();
            long cancelledB = eqBookings.stream().filter(b -> Booking.CANCELLED.equals(b.getStatus())).count();
            long noShowB = eqBookings.stream().filter(b -> Booking.NO_SHOW.equals(b.getStatus())).count();

            EquipmentUtilizationReportDTO dto = new EquipmentUtilizationReportDTO();
            dto.setEquipmentId(eqId);
            dto.setEquipmentName(eq.getName());
            dto.setCategory(eq.getCategory() != null ? eq.getCategory() : "Uncategorized"); // added — matches heatmap e.category
            dto.setStatus(eq.getStatus());                                                   // added — matches heatmap e.status
            dto.setDepartmentId(eq.getDepartmentId());
            dto.setDepartmentName(deptNames.getOrDefault(eq.getDepartmentId(), "Unknown Department"));
            dto.setTotalAvailableHours(totalAvail);
            dto.setTotalUtilizedHours(totalUtil);
            dto.setUtilizationPercentage(utilPct);
            dto.setTotalBookings(totalB);
            dto.setCompletedBookings(completedB);
            dto.setCancelledBookings(cancelledB);
            dto.setNoShowCount(noShowB);
            dto.setIdleTime(totalIdle);


            report.add(dto);
        }

        return report;
    }

    // ─── 2. MAINTENANCE AND DOWNTIME REPORT ───────────────────────────────

    public List<MaintenanceDowntimeReportDTO> getMaintenanceDowntimeReport(
            UserPrincipal principal, LocalDate from, LocalDate to, Long filterDepartmentId, Long filterEquipmentId) {

        validateDates(from, to);
        LocalDate actualFrom = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate actualTo = to != null ? to : LocalDate.now();

        List<Equipment> authorized = getAuthorizedEquipment(principal, filterDepartmentId);
        if (filterEquipmentId != null) {
            authorized = authorized.stream()
                    .filter(e -> filterEquipmentId.equals(e.getEquipmentId()))
                    .toList();
        }

        if (authorized.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> eqIds = authorized.stream().map(Equipment::getEquipmentId).toList();

        // Query maintenance requests created in the range
        List<MaintenanceRequest> requests = maintenanceRequestRepository
                .findByEquipmentIdInAndCreatedAtBetween(eqIds, actualFrom.atStartOfDay(), actualTo.atTime(23, 59, 59));

        // Group requests by equipment ID for counting
        List<MaintenanceRequest> allRequestsForEq = maintenanceRequestRepository.findByEquipmentIdIn(eqIds);
        Map<Long, Long> countsByEq = allRequestsForEq.stream()
                .collect(Collectors.groupingBy(MaintenanceRequest::getEquipmentId, Collectors.counting()));

        // Map equipment for lookup
        Map<Long, Equipment> eqMap = authorized.stream()
                .collect(Collectors.toMap(Equipment::getEquipmentId, e -> e));

        // Fetch Technicians
        List<AppUser> techs = appUserRepository.findByRoleName("LAB_TECHNICIAN");
        Map<Long, String> techNames = techs.stream()
                .collect(Collectors.toMap(AppUser::getUserId, u -> u.getFirstName() + " " + u.getLastName(), (a, b) -> a));

        // Fetch Department names
        Map<Long, String> deptNames = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(Department::getDepartmentId, Department::getName, (a, b) -> a));

        // Fetch issue reports to link dates
        List<EquipmentIssueReport> issueReports = issueReportRepository.findByEquipmentIdIn(eqIds);
        Map<Long, EquipmentIssueReport> issueMap = issueReports.stream()
                .collect(Collectors.toMap(EquipmentIssueReport::getIssueReportId, r -> r, (a, b) -> a));

        List<MaintenanceDowntimeReportDTO> reportList = new ArrayList<>();

        for (MaintenanceRequest r : requests) {
            Equipment eq = eqMap.get(r.getEquipmentId());
            if (eq == null) continue;

            String techName = r.getAssignedTechnicianId() != null
                    ? techNames.getOrDefault(r.getAssignedTechnicianId(), "ID: " + r.getAssignedTechnicianId())
                    : "Unassigned";

            LocalDateTime reportDate = r.getCreatedAt();
            if (r.getIssueReportId() != null) {
                EquipmentIssueReport reportEntity = issueMap.get(r.getIssueReportId());
                if (reportEntity != null) {
                    reportDate = reportEntity.getCreatedAt();
                }
            }

            String verif = "N/A";
            if (MaintenanceRequest.COMPLETED.equals(r.getStatus())) {
                verif = "VERIFIED_COMPLETED";
            } else if (MaintenanceRequest.REJECTED.equals(r.getStatus())) {
                verif = "REJECTED";
            } else if (MaintenanceRequest.PENDING_VERIFICATION.equals(r.getStatus())) {
                verif = "PENDING_VERIFICATION";
            }

            MaintenanceDowntimeReportDTO dto = new MaintenanceDowntimeReportDTO();
            dto.setEquipmentName(eq.getName());
            dto.setEquipmentId(eq.getEquipmentId());
            dto.setDepartmentId(eq.getDepartmentId());
            dto.setDepartmentName(deptNames.getOrDefault(eq.getDepartmentId(), "Unknown"));
            dto.setIssueDescription(r.getIssueDescription());
            dto.setIssueReportDate(reportDate);
            dto.setAssignedTechnician(techName);
            dto.setMaintenanceStatus(r.getStatus());
            dto.setDowntimeStartedAt(r.getDowntimeStartedAt());
            dto.setCompletedAt(r.getCompletedAt());
            dto.setTotalDowntimeHours(r.getDowntimeHours() != null ? r.getDowntimeHours() : BigDecimal.ZERO);
            dto.setVerificationResult(verif);
            dto.setMaintenanceRequestCount(countsByEq.getOrDefault(eq.getEquipmentId(), 0L));

            reportList.add(dto);
        }

        return reportList;
    }

    // ─── 3. BOOKING AND USAGE REPORT ──────────────────────────────────────

    public List<BookingUsageReportDTO> getBookingUsageReport(
            UserPrincipal principal, LocalDate from, LocalDate to, Long filterDepartmentId, Long filterEquipmentId) {

        validateDates(from, to);
        LocalDate actualFrom = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate actualTo = to != null ? to : LocalDate.now();

        List<Equipment> authorized = getAuthorizedEquipment(principal, filterDepartmentId);
        if (filterEquipmentId != null) {
            authorized = authorized.stream()
                    .filter(e -> filterEquipmentId.equals(e.getEquipmentId()))
                    .toList();
        }

        if (authorized.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> eqIds = authorized.stream().map(Equipment::getEquipmentId).toList();

        List<Booking> bookings = bookingRepository
                .findByEquipmentIdInAndStartTimeBetween(eqIds, actualFrom.atStartOfDay(), actualTo.atTime(23, 59, 59));

        if (bookings.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> bookingIds = bookings.stream().map(Booking::getBookingId).toList();
        List<UtilizationLog> logs = utilizationLogRepository.findByBookingIdIn(bookingIds);
        Map<Long, UtilizationLog> logMap = logs.stream()
                .collect(Collectors.toMap(UtilizationLog::getBookingId, l -> l, (a, b) -> a));

        List<Long> userIds = bookings.stream().map(Booking::getUserId).distinct().toList();
        List<AppUser> users = appUserRepository.findAllById(userIds);
        Map<Long, AppUser> userMap = users.stream()
                .collect(Collectors.toMap(AppUser::getUserId, u -> u, (a, b) -> a));

        Map<Long, String> eqNames = authorized.stream()
                .collect(Collectors.toMap(Equipment::getEquipmentId, Equipment::getName));

        List<BookingUsageReportDTO> dtoList = new ArrayList<>();

        for (Booking b : bookings) {
            AppUser u = userMap.get(b.getUserId());
            String userName = u != null ? u.getFirstName() + " " + u.getLastName() : "Unknown User";
            String userEmail = u != null ? u.getEmail() : "N/A";

            UtilizationLog ul = logMap.get(b.getBookingId());
            Integer duration = ul != null ? ul.getDurationMinutes() : null;

            BookingUsageReportDTO dto = new BookingUsageReportDTO();
            dto.setEquipmentName(eqNames.getOrDefault(b.getEquipmentId(), "Unknown Equipment"));
            dto.setEquipmentId(b.getEquipmentId());
            dto.setUserId(b.getUserId());
            dto.setUserName(userName);
            dto.setUserEmail(userEmail);
            dto.setBookingDate(b.getCreatedAt() != null ? b.getCreatedAt() : b.getStartTime());
            dto.setScheduledStart(b.getStartTime());
            dto.setScheduledEnd(b.getEndTime());
            dto.setActualUsageDurationMinutes(duration);
            dto.setBookingStatus(b.getStatus());
            dto.setCompleted(Booking.COMPLETED.equals(b.getStatus()));
            dto.setCancelled(Booking.CANCELLED.equals(b.getStatus()));
            dto.setNoShow(Booking.NO_SHOW.equals(b.getStatus()));
            dto.setEstimatedCost(b.getEstimatedCost() != null ? b.getEstimatedCost() : BigDecimal.ZERO);
            dto.setActualCost(b.getActualCost() != null ? b.getActualCost() : BigDecimal.ZERO);

            dtoList.add(dto);
        }

        return dtoList;
    }

    // ─── 4. DEPARTMENT PERFORMANCE REPORT ──────────────────────────────────

    public DepartmentPerformanceReportDTO getDepartmentPerformanceReport(
            UserPrincipal principal, LocalDate from, LocalDate to, Long filterDepartmentId) {

        List<String> roles = principal.getRoleNames();
        Long deptId;

        if (roles.contains(Role.SYSTEM_ADMIN) || roles.contains("ROLE_SYSTEM_ADMIN")) {
            deptId = filterDepartmentId != null ? filterDepartmentId : principal.getDepartmentId();
        } else if (roles.contains(Role.INSTITUTION_ADMIN) || roles.contains("ROLE_INSTITUTION_ADMIN")) {
            if (filterDepartmentId != null) {
                Department dept = departmentRepository.findById(filterDepartmentId)
                        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Department not found."));
                if (!dept.getInstitutionId().equals(principal.getInstitutionId())) {
                    throw new ApiException(HttpStatus.FORBIDDEN, "Access denied. Department does not belong to your institution.");
                }
                deptId = filterDepartmentId;
            } else {
                deptId = principal.getDepartmentId();
            }
        } else {
            deptId = principal.getDepartmentId();
        }

        if (deptId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Department ID is required for department performance report.");
        }

        validateDates(from, to);
        LocalDate actualFrom = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate actualTo = to != null ? to : LocalDate.now();

        // 1. Current Live Snapshot Metrics
        List<Equipment> eqList = equipmentRepository.findByDepartmentId(deptId);
        long totalEq = eqList.size();
        long availEq = eqList.stream().filter(e -> Equipment.AVAILABLE.equals(e.getStatus())).count();
        long maintEq = eqList.stream().filter(e -> Equipment.UNDER_MAINTENANCE.equals(e.getStatus())).count();
        long oosEq = eqList.stream().filter(e -> Equipment.OUT_OF_SERVICE.equals(e.getStatus())).count();

        if (eqList.isEmpty()) {
            return new DepartmentPerformanceReportDTO(
                    totalEq, availEq, maintEq, oosEq,
                    0L, 0L, 0L, 0L, BigDecimal.ZERO, BigDecimal.ZERO,
                    BigDecimal.ZERO, BigDecimal.ZERO, "N/A"
            );
        }

        List<Long> eqIds = eqList.stream().map(Equipment::getEquipmentId).toList();

        // 2. Date-Range Bookings Metrics
        List<Booking> bookings = bookingRepository
                .findByEquipmentIdInAndStartTimeBetween(eqIds, actualFrom.atStartOfDay(), actualTo.atTime(23, 59, 59));
        long totalB = bookings.size();
        long completedB = bookings.stream().filter(b -> Booking.COMPLETED.equals(b.getStatus())).count();
        long cancelledB = bookings.stream().filter(b -> Booking.CANCELLED.equals(b.getStatus())).count();
        long noShowB = bookings.stream().filter(b -> Booking.NO_SHOW.equals(b.getStatus())).count();

        BigDecimal noShowRate = BigDecimal.ZERO;
        if (totalB > 0) {
            noShowRate = BigDecimal.valueOf(noShowB * 100.0 / totalB).setScale(2, RoundingMode.HALF_UP);
        }

        // 3. Department Utilization Rate
        // Aggregate daily metrics
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDate metricEnd = actualTo.isBefore(LocalDate.now()) ? actualTo : yesterday;
        List<UtilizationMetric> metrics = Collections.emptyList();
        if (!actualFrom.isAfter(metricEnd)) {
            metrics = utilizationMetricRepository.findByEquipmentIdInAndPeriodDateBetween(eqIds, actualFrom, metricEnd);
        }

        double totalAvailHours = metrics.stream()
                .mapToDouble(m -> m.getTotalAvailableHours() != null ? m.getTotalAvailableHours().doubleValue() : 0.0)
                .sum();
        double totalUtilHours = metrics.stream()
                .mapToDouble(m -> m.getTotalUsedHours() != null ? m.getTotalUsedHours().doubleValue() : 0.0)
                .sum();

        // Blend with today's live stats if range contains today
        if (!actualTo.isBefore(LocalDate.now())) {
            int todayDOW = LocalDate.now().getDayOfWeek().getValue();
            for (Equipment eq : eqList) {
                double schedHours = scheduleRepository.findByEquipmentIdAndDayOfWeek(eq.getEquipmentId(), todayDOW)
                        .map(s -> {
                            if (Boolean.FALSE.equals(s.getIsAvailable())) return 0.0;
                            return (double) Duration.between(s.getOpenTime(), s.getCloseTime()).toMinutes() / 60.0;
                        }).orElse(8.0);
                totalAvailHours += schedHours;

                List<UtilizationLog> todayLogs = utilizationLogRepository
                        .findByEquipmentIdInAndUsageStartTimeAfter(List.of(eq.getEquipmentId()), LocalDate.now().atStartOfDay());
                double todayUsed = todayLogs.stream()
                        .mapToDouble(l -> l.getDurationMinutes() != null ? l.getDurationMinutes() / 60.0 : 0.0)
                        .sum();
                totalUtilHours += todayUsed;
            }
        }

        BigDecimal deptUtilRate = BigDecimal.ZERO;
        if (totalAvailHours > 0) {
            deptUtilRate = BigDecimal.valueOf(totalUtilHours * 100.0 / totalAvailHours).setScale(2, RoundingMode.HALF_UP);
        }

        // 4. Total Downtime Hours in date-range
        List<MaintenanceRequest> maintRequests = maintenanceRequestRepository
                .findByEquipmentIdInAndCreatedAtBetween(eqIds, actualFrom.atStartOfDay(), actualTo.atTime(23, 59, 59));
        BigDecimal totalDowntime = maintRequests.stream()
                .map(m -> m.getDowntimeHours() != null ? m.getDowntimeHours() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 5. Total Usage Cost (completed bookings in date range)
        BigDecimal totalUsageCost = bookings.stream()
                .filter(b -> Booking.COMPLETED.equals(b.getStatus()))
                .map(b -> b.getActualCost() != null ? b.getActualCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 6. Most Used Equipment (by count of completed bookings)
        Map<Long, Long> completedCounts = bookings.stream()
                .filter(b -> Booking.COMPLETED.equals(b.getStatus()))
                .collect(Collectors.groupingBy(Booking::getEquipmentId, Collectors.counting()));
        
        String mostUsedName = "N/A";
        if (!completedCounts.isEmpty()) {
            Long maxEqId = Collections.max(completedCounts.entrySet(), Map.Entry.comparingByValue()).getKey();
            mostUsedName = eqList.stream()
                    .filter(e -> maxEqId.equals(e.getEquipmentId()))
                    .findFirst()
                    .map(Equipment::getName)
                    .orElse("N/A");
        }

        return new DepartmentPerformanceReportDTO(
                totalEq, availEq, maintEq, oosEq,
                totalB, completedB, cancelledB, noShowB, noShowRate,
                deptUtilRate, totalDowntime, totalUsageCost, mostUsedName
        );
    }

    // ─── 5. CALIBRATION AND CERTIFICATION COMPLIANCE REPORT ──────────────

    public ComplianceReportDTO getComplianceReport(UserPrincipal principal, Long filterDepartmentId) {
        List<Equipment> authorized = getAuthorizedEquipment(principal, filterDepartmentId);
        if (authorized.isEmpty()) {
            return new ComplianceReportDTO(Collections.emptyList(), Collections.emptyList(), Map.of(
                    "valid", 0L, "expiringSoon", 0L, "dueSoon", 0L, "overdue", 0L, "expired", 0L
            ));
        }

        List<Long> eqIds = authorized.stream().map(Equipment::getEquipmentId).toList();
        Map<Long, String> eqNames = authorized.stream()
                .collect(Collectors.toMap(Equipment::getEquipmentId, Equipment::getName));

        // 1. Fetch Calibrations
        List<EquipmentCalibration> allCalibrations = calibrationRepository.findByEquipmentIdIn(eqIds);
        Map<Long, List<EquipmentCalibration>> calByEq = allCalibrations.stream()
                .collect(Collectors.groupingBy(EquipmentCalibration::getEquipmentId));

        List<ComplianceReportDTO.CalibrationItem> calibrationItems = new ArrayList<>();
        LocalDate today = LocalDate.now();
        long dueSoonCount = 0;
        long overdueCount = 0;
        long validCount = 0;

        for (Equipment eq : authorized) {
            List<EquipmentCalibration> eqCals = calByEq.getOrDefault(eq.getEquipmentId(), Collections.emptyList());
            if (eqCals.isEmpty()) continue;

            // Get latest calibration
            EquipmentCalibration cal = eqCals.stream()
                    .max(Comparator.comparing(EquipmentCalibration::getNextDueDate))
                    .orElse(null);

            if (cal != null) {
                String state = "OK";
                String calStatus = "VALID";
                if (cal.getNextDueDate().isBefore(today)) {
                    state = "OVERDUE";
                    calStatus = "OVERDUE";
                    overdueCount++;
                } else if (!cal.getNextDueDate().isAfter(today.plusDays(30))) {
                    state = "DUE_SOON";
                    calStatus = "DUE_SOON";
                    dueSoonCount++;
                } else {
                    validCount++;
                }

                calibrationItems.add(new ComplianceReportDTO.CalibrationItem(
                        eq.getName(), eq.getEquipmentId(), cal.getCalibrationDate(), cal.getNextDueDate(), calStatus, state
                ));
            }
        }

        // 2. Fetch Certifications
        List<EquipmentCertification> certs = certificationRepository.findByEquipmentIdIn(eqIds);
        List<ComplianceReportDTO.CertificationItem> certificationItems = new ArrayList<>();
        long certExpired = 0;
        long certExpiringSoon = 0;
        long certValid = 0;

        for (EquipmentCertification c : certs) {
            String status = c.getStatus();
            if (EquipmentCertification.EXPIRED.equals(status) || EquipmentCertification.REVOKED.equals(status)) {
                certExpired++;
            } else if (EquipmentCertification.EXPIRING_SOON.equals(status)) {
                certExpiringSoon++;
            } else {
                certValid++;
            }

            certificationItems.add(new ComplianceReportDTO.CertificationItem(
                    eqNames.getOrDefault(c.getEquipmentId(), "Unknown Equipment"),
                    c.getEquipmentId(), c.getCertificateName(), c.getCertificateNumber(),
                    c.getIssueDate(), c.getExpiryDate(), status
            ));
        }

        Map<String, Long> summary = new HashMap<>();
        summary.put("valid", validCount + certValid);
        summary.put("expiringSoon", certExpiringSoon);
        summary.put("dueSoon", dueSoonCount);
        summary.put("overdue", overdueCount);
        summary.put("expired", certExpired);

        return new ComplianceReportDTO(calibrationItems, certificationItems, summary);
    }

    // ─── 6. EQUIPMENT SHARING AND COST REPORT ──────────────────────────────

    public List<SharingCostReportDTO> getSharingCostReport(
            UserPrincipal principal, Long filterDepartmentId) {

        List<Equipment> authorized = getAuthorizedEquipment(principal, filterDepartmentId);
        if (authorized.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> eqIds = authorized.stream().map(Equipment::getEquipmentId).toList();
        Map<Long, Equipment> eqMap = authorized.stream()
                .collect(Collectors.toMap(Equipment::getEquipmentId, e -> e));

        // Get Sharing Agreements
        List<SharingAgreement> agreements = sharingAgreementRepository.findByEquipmentIdIn(eqIds);
        if (agreements.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> agreementIds = agreements.stream().map(SharingAgreement::getAgreementId).toList();
        Map<Long, SharingAgreement> agreementMap = agreements.stream()
                .collect(Collectors.toMap(SharingAgreement::getAgreementId, a -> a));

        // Fetch Shared Bookings
        List<SharedBooking> sharedBookings = sharedBookingRepository.findByAgreementIdIn(agreementIds);
        Map<Long, List<SharedBooking>> sharedByAgreement = sharedBookings.stream()
                .collect(Collectors.groupingBy(SharedBooking::getAgreementId));

        // Fetch Invoices
        List<Invoice> invoices = invoiceRepository.findBySharingAgreementIdIn(agreementIds);
        Map<Long, List<Invoice>> invoicesByAgreement = invoices.stream()
                .collect(Collectors.groupingBy(Invoice::getSharingAgreementId));

        // Fetch all Bookings for status checks
        List<Long> bookingIds = sharedBookings.stream().map(SharedBooking::getBookingId).distinct().toList();
        List<Booking> bookings = bookingRepository.findAllById(bookingIds);
        Map<Long, Booking> bookingMap = bookings.stream()
                .collect(Collectors.toMap(Booking::getBookingId, b -> b));

        // Fetch Resource Sharing Requests for mapping statuses
        List<ResourceSharingRequest> sharingRequests = resourceSharingRequestRepository.findAll();
        Map<String, String> requestStatusMap = new HashMap<>(); // key = "eqId-requestingInstId"
        for (ResourceSharingRequest req : sharingRequests) {
            String key = req.getEquipmentId() + "-" + req.getRequestingInstitutionId();
            requestStatusMap.put(key, req.getStatus());
        }

        // Fetch Institutions
        Map<Long, String> instNames = institutionRepository.findAll().stream()
                .collect(Collectors.toMap(Institution::getInstitutionId, Institution::getName, (a, b) -> a));

        List<SharingCostReportDTO> list = new ArrayList<>();

        for (SharingAgreement sa : agreements) {
            Equipment eq = eqMap.get(sa.getEquipmentId());
            if (eq == null) continue;

            List<SharedBooking> saBookings = sharedByAgreement.getOrDefault(sa.getAgreementId(), Collections.emptyList());
            List<Invoice> saInvoices = invoicesByAgreement.getOrDefault(sa.getAgreementId(), Collections.emptyList());

            BigDecimal estFee = saBookings.stream()
                    .map(b -> b.getEstimatedFee() != null ? b.getEstimatedFee() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal usageFee = saBookings.stream()
                    .map(b -> b.getUsageFee() != null ? b.getUsageFee() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String requestKey = sa.getEquipmentId() + "-" + sa.getRequestingInstitutionId();
            String reqStatus = requestStatusMap.getOrDefault(requestKey, "APPROVED");

            String bookingStatus = "N/A";
            if (!saBookings.isEmpty()) {
                Booking bk = bookingMap.get(saBookings.get(0).getBookingId());
                if (bk != null) bookingStatus = bk.getStatus();
            }

            String invoiceStatus = "N/A";
            if (!saInvoices.isEmpty()) {
                invoiceStatus = saInvoices.get(0).getStatus();
            }

            String paymentStatus = "N/A";
            if (!saBookings.isEmpty()) {
                paymentStatus = saBookings.get(0).getPaymentStatus();
            }

            SharingCostReportDTO dto = new SharingCostReportDTO();
            dto.setEquipmentName(eq.getName());
            dto.setEquipmentId(eq.getEquipmentId());
            dto.setOwningInstitutionId(sa.getOwningInstitutionId());
            dto.setOwningInstitution(instNames.getOrDefault(sa.getOwningInstitutionId(), "Institution ID: " + sa.getOwningInstitutionId()));
            dto.setRequestingInstitutionId(sa.getRequestingInstitutionId());
            dto.setRequestingInstitution(instNames.getOrDefault(sa.getRequestingInstitutionId(), "Institution ID: " + sa.getRequestingInstitutionId()));
            dto.setSharingRequestStatus(reqStatus);
            dto.setAgreementStatus(sa.getStatus());
            dto.setSharedBookingStatus(bookingStatus);
            dto.setEstimatedFee(estFee);
            dto.setFinalUsageFee(usageFee);
            dto.setInvoiceStatus(invoiceStatus);
            dto.setPaymentStatus(paymentStatus);

            list.add(dto);
        }

        return list;
    }

    // ─── 7. FIX ISSUES / ISSUE SUMMARY SECTION ──────────────────────────────

    public IssueSummaryResponseDTO getIssueSummaryReport(
            UserPrincipal principal, Long filterDepartmentId, Long filterEquipmentId, String categoryFilter, LocalDate from, LocalDate to) {

        validateDates(from, to);
        LocalDate actualFrom = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate actualTo = to != null ? to : LocalDate.now();

        List<Equipment> authorized = getAuthorizedEquipment(principal, filterDepartmentId);
        if (filterEquipmentId != null) {
            authorized = authorized.stream()
                    .filter(e -> filterEquipmentId.equals(e.getEquipmentId()))
                    .toList();
        }

        if (authorized.isEmpty()) {
            return new IssueSummaryResponseDTO(Map.of(
                    "needsAttention", 0L, "underMaintenance", 0L, "critical", 0L, "resolved", 0L
            ), Collections.emptyList());
        }

        List<Long> eqIds = authorized.stream().map(Equipment::getEquipmentId).toList();

        // Query issue reports in range
        List<EquipmentIssueReport> reports = issueReportRepository.findByEquipmentIdIn(eqIds).stream()
                .filter(r -> (from == null || !r.getCreatedAt().toLocalDate().isBefore(actualFrom))
                        && (to == null || !r.getCreatedAt().toLocalDate().isAfter(actualTo)))
                .toList();

        // Query maintenance requests in range
        List<MaintenanceRequest> maintenanceList = maintenanceRequestRepository.findByEquipmentIdIn(eqIds).stream()
                .filter(m -> (from == null || !m.getCreatedAt().toLocalDate().isBefore(actualFrom))
                        && (to == null || !m.getCreatedAt().toLocalDate().isAfter(actualTo)))
                .toList();

        // Grouping
        Map<Long, List<EquipmentIssueReport>> reportsByEq = reports.stream()
                .collect(Collectors.groupingBy(EquipmentIssueReport::getEquipmentId));
        Map<Long, List<MaintenanceRequest>> maintByEq = maintenanceList.stream()
                .collect(Collectors.groupingBy(MaintenanceRequest::getEquipmentId));

        // Get Department names
        Map<Long, String> deptNames = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(Department::getDepartmentId, Department::getName, (a, b) -> a));

        // Get Technicians names
        Map<Long, String> techNames = appUserRepository.findByRoleName("LAB_TECHNICIAN").stream()
                .collect(Collectors.toMap(AppUser::getUserId, u -> u.getFirstName() + " " + u.getLastName(), (a, b) -> a));

        List<IssueSummaryReportDTO> issues = new ArrayList<>();
        long needsAttention = 0;
        long underMaint = 0;
        long critical = 0;
        long resolved = 0;

        for (Equipment eq : authorized) {
            Long eqId = eq.getEquipmentId();

            List<EquipmentIssueReport> eqReports = reportsByEq.getOrDefault(eqId, Collections.emptyList());
            List<MaintenanceRequest> eqMaint = maintByEq.getOrDefault(eqId, Collections.emptyList());

            long openIssues = eqReports.stream().filter(r -> "OPEN".equals(r.getStatus())).count();
            long activeMaint = eqMaint.stream().filter(m -> !MaintenanceRequest.COMPLETED.equals(m.getStatus()) && !MaintenanceRequest.CANCELLED.equals(m.getStatus())).count();
            long rejectedVerif = eqMaint.stream().filter(m -> MaintenanceRequest.REJECTED.equals(m.getStatus())).count();

            long openMaint = eqMaint.stream().filter(m -> MaintenanceRequest.OPEN.equals(m.getStatus())).count();
            long assignedMaint = eqMaint.stream().filter(m -> MaintenanceRequest.ASSIGNED.equals(m.getStatus())).count();
            long inProgMaint = eqMaint.stream().filter(m -> MaintenanceRequest.IN_PROGRESS.equals(m.getStatus())).count();
            long pendingVerifMaint = eqMaint.stream().filter(m -> MaintenanceRequest.PENDING_VERIFICATION.equals(m.getStatus())).count();
            long rejectedMaint = eqMaint.stream().filter(m -> MaintenanceRequest.REJECTED.equals(m.getStatus())).count();

            BigDecimal totalDowntime = eqMaint.stream()
                    .map(m -> m.getDowntimeHours() != null ? m.getDowntimeHours() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Determine latest issue details
            String latestDesc = "No description available";
            LocalDateTime latestDate = null;
            String assignedTech = "Unassigned";
            Long assignedTechId = null;
            String currentMaintStatus = "N/A";
            String priority = "MEDIUM";
            Long latestIssueReportId = null;
            Long activeMaintId = null;

            // Find latest report
            EquipmentIssueReport latestReport = eqReports.stream()
                    .max(Comparator.comparing(EquipmentIssueReport::getCreatedAt))
                    .orElse(null);
            if (latestReport != null) {
                latestDesc = latestReport.getIssueDescription();
                latestDate = latestReport.getCreatedAt();
                priority = latestReport.getPriority();
                latestIssueReportId = latestReport.getIssueReportId();
            }

            // Find latest request
            MaintenanceRequest latestReq = eqMaint.stream()
                    .max(Comparator.comparing(MaintenanceRequest::getCreatedAt))
                    .orElse(null);
            if (latestReq != null) {
                if (latestDate == null || latestReq.getCreatedAt().isAfter(latestDate)) {
                    latestDesc = latestReq.getIssueDescription();
                    latestDate = latestReq.getCreatedAt();
                    priority = latestReq.getPriority();
                }
                currentMaintStatus = latestReq.getStatus();
                activeMaintId = latestReq.getMaintenanceId();

                if (latestReq.getAssignedTechnicianId() != null) {
                    assignedTechId = latestReq.getAssignedTechnicianId();
                    assignedTech = techNames.getOrDefault(assignedTechId, "Technician ID: " + assignedTechId);
                }
            }

            // Determine computed category
            String computedCategory = "Resolved";
            if (Equipment.OUT_OF_SERVICE.equals(eq.getStatus())) {
                computedCategory = "Critical / Out of Service";
                critical++;
            } else if (openIssues > 0 || openMaint > 0 || assignedMaint > 0 || rejectedMaint > 0) {
                computedCategory = "Needs Attention";
                needsAttention++;
            } else if (Equipment.UNDER_MAINTENANCE.equals(eq.getStatus()) || inProgMaint > 0 || pendingVerifMaint > 0) {
                computedCategory = "Under Maintenance";
                underMaint++;
            } else {
                resolved++;
            }

            // Apply categoryFilter if present
            if (categoryFilter != null && !computedCategory.equalsIgnoreCase(categoryFilter)) {
                // If it is filtered out, we still calculate the totals but don't add to list
                continue;
            }

            IssueSummaryReportDTO dto = new IssueSummaryReportDTO();
            dto.setEquipmentName(eq.getName());
            dto.setEquipmentId(eqId);
            dto.setDepartmentId(eq.getDepartmentId());
            dto.setDepartmentName(deptNames.getOrDefault(eq.getDepartmentId(), "Unknown"));
            dto.setOpenIssueReportCount(openIssues);
            dto.setActiveMaintenanceRequestCount(activeMaint);
            dto.setRejectedMaintenanceVerificationCount(rejectedVerif);
            dto.setOpenMaintenanceCount(openMaint);
            dto.setAssignedMaintenanceCount(assignedMaint);
            dto.setInProgressMaintenanceCount(inProgMaint);
            dto.setPendingVerificationMaintenanceCount(pendingVerifMaint);
            dto.setRejectedMaintenanceCount(rejectedMaint);
            dto.setCurrentEquipmentStatus(eq.getStatus());
            dto.setTotalDowntime(totalDowntime);
            dto.setLatestIssueDescription(latestDesc);
            dto.setLatestIssueReportedDate(latestDate);
            dto.setAssignedTechnician(assignedTech);
            dto.setCurrentMaintenanceStatus(currentMaintStatus);
            dto.setPriority(priority);
            dto.setCategory(computedCategory);
            dto.setLatestIssueReportId(latestIssueReportId);
            dto.setActiveMaintenanceRequestId(activeMaintId);
            dto.setAssignedTechnicianId(assignedTechId);

            issues.add(dto);
        }

        Map<String, Long> summary = new HashMap<>();
        summary.put("needsAttention", needsAttention);
        summary.put("underMaintenance", underMaint);
        summary.put("critical", critical);
        summary.put("resolved", resolved);

        return new IssueSummaryResponseDTO(summary, issues);
    }


    // ─── MILESTONE 3 — PHASE 1: UTILIZATION EFFECTIVENESS REPORT ────────────

    /**
     * Returns a structured utilization effectiveness report for the authorized scope.
     *
     * Authorization:
     *  - LAB_MANAGER / DEPARTMENT_HEAD → own department only
     *  - INSTITUTION_ADMIN → full institution; departmentComparison populated
     *  - SYSTEM_ADMIN → not included in this endpoint
     *
     * Trend granularity:
     *  - ≤ 31 days → daily points
     *  - > 31 days → monthly points
     *
     * Utilization score is sourced from UtilizationMetric (same as existing
     * getEquipmentUtilizationReport), plus live UtilizationLog for today.
     * Classification: LOW < 30% | MODERATE 30-50% | GOOD 50-70% | HIGH ≥ 70%
     */
    public UtilizationEffectivenessReportDto getUtilizationEffectivenessReport(
            UserPrincipal principal,
            LocalDate from,
            LocalDate to,
            Long filterDepartmentId,
            Long filterLaboratoryId) {

        validateDates(from, to);
        LocalDate actualFrom = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate actualTo   = to   != null ? to   : LocalDate.now();

        List<String> roles      = principal.getRoleNames();
        Long userInstId         = principal.getInstitutionId();
        Long userDeptId         = principal.getDepartmentId();
        boolean isInstAdmin     = roles.contains(Role.INSTITUTION_ADMIN) || roles.contains("ROLE_INSTITUTION_ADMIN");

        // ── 1. Resolve authorized equipment ─────────────────────────────────
        List<Equipment> authorized = getAuthorizedEquipment(principal, filterDepartmentId);
        if (filterLaboratoryId != null) {
            authorized = authorized.stream()
                    .filter(e -> filterLaboratoryId.equals(e.getLabId()))
                    .toList();
        }

        List<Long> eqIds = authorized.stream().map(Equipment::getEquipmentId).toList();

        // ── 2. Lookup maps ───────────────────────────────────────────────────
        Map<Long, String> deptNames = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(Department::getDepartmentId, Department::getName, (a, b) -> a));

        List<Laboratory> allLabs = isInstAdmin
                ? laboratoryRepository.findByInstitutionIdAndIsActiveTrue(userInstId)
                : laboratoryRepository.findByDepartmentId(userDeptId != null ? userDeptId : -1L);
        Map<Long, String> labNames = allLabs.stream()
                .collect(Collectors.toMap(Laboratory::getLabId, Laboratory::getName, (a, b) -> a));

        // ── 3. Fetch UtilizationMetrics for the date range ──────────────────
        LocalDate yesterday  = LocalDate.now().minusDays(1);
        LocalDate metricEnd  = actualTo.isBefore(LocalDate.now()) ? actualTo : yesterday;

        List<UtilizationMetric> metrics = Collections.emptyList();
        if (!eqIds.isEmpty() && !actualFrom.isAfter(metricEnd)) {
            metrics = utilizationMetricRepository.findByEquipmentIdInAndPeriodDateBetween(eqIds, actualFrom, metricEnd);
        }
        Map<Long, List<UtilizationMetric>> metricsByEq = metrics.stream()
                .collect(Collectors.groupingBy(UtilizationMetric::getEquipmentId));

        // ── 4. Live logs for today if range includes today ───────────────────
        boolean includesToday = !actualTo.isBefore(LocalDate.now());
        Map<Long, List<UtilizationLog>> todayLogsByEq = Collections.emptyMap();
        Map<Long, List<EquipmentOperatingSchedule>> schedulesByEq = Collections.emptyMap();

        if (includesToday && !eqIds.isEmpty()) {
            LocalDateTime todayStart = LocalDate.now().atStartOfDay();
            List<UtilizationLog> todayLogs = utilizationLogRepository
                    .findByEquipmentIdInAndUsageStartTimeAfter(eqIds, todayStart);
            todayLogsByEq = todayLogs.stream().collect(Collectors.groupingBy(UtilizationLog::getEquipmentId));

            int todayDOW = LocalDate.now().getDayOfWeek().getValue();
            List<EquipmentOperatingSchedule> schedList = new ArrayList<>();
            for (Long eqId : eqIds) {
                scheduleRepository.findByEquipmentIdAndDayOfWeek(eqId, todayDOW).ifPresent(schedList::add);
            }
            schedulesByEq = schedList.stream().collect(Collectors.groupingBy(EquipmentOperatingSchedule::getEquipmentId));
        }

        // ── 5. Bookings in range ─────────────────────────────────────────────
        LocalDateTime startDt = actualFrom.atStartOfDay();
        LocalDateTime endDt   = actualTo.atTime(23, 59, 59);
        List<Booking> bookings = eqIds.isEmpty() ? Collections.emptyList()
                : bookingRepository.findByEquipmentIdInAndStartTimeBetween(eqIds, startDt, endDt);
        Map<Long, Long> bookingCountByEq = bookings.stream()
                .collect(Collectors.groupingBy(Booking::getEquipmentId, Collectors.counting()));

        // ── 6. Per-equipment aggregation ─────────────────────────────────────
        List<UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto> equipmentItems = new ArrayList<>();
        double totalUsed = 0, totalAvail = 0, totalIdle = 0;
        long totalBookings = 0;
        Set<Long> labSet = new HashSet<>(), deptSet = new HashSet<>();

        for (Equipment eq : authorized) {
            Long eqId = eq.getEquipmentId();
            deptSet.add(eq.getDepartmentId());
            if (eq.getLabId() != null) labSet.add(eq.getLabId());

            // Historical metrics
            BigDecimal histAvail = BigDecimal.ZERO, histUsed = BigDecimal.ZERO, histIdle = BigDecimal.ZERO;
            for (UtilizationMetric m : metricsByEq.getOrDefault(eqId, Collections.emptyList())) {
                histAvail = histAvail.add(nvl(m.getTotalAvailableHours()));
                histUsed  = histUsed .add(nvl(m.getTotalUsedHours()));
                histIdle  = histIdle .add(nvl(m.getIdleTimeHours()));
            }

            // Live today
            BigDecimal todayAvail = BigDecimal.ZERO, todayUsed = BigDecimal.ZERO;
            if (includesToday) {
                List<EquipmentOperatingSchedule> eqScheds = schedulesByEq.getOrDefault(eqId, Collections.emptyList());
                double schedHours = 8.0;
                if (!eqScheds.isEmpty()) {
                    EquipmentOperatingSchedule s = eqScheds.get(0);
                    if (Boolean.TRUE.equals(s.getIsAvailable()) && s.getOpenTime() != null && s.getCloseTime() != null) {
                        schedHours = (double) Duration.between(s.getOpenTime(), s.getCloseTime()).toMinutes() / 60.0;
                    } else if (Boolean.FALSE.equals(s.getIsAvailable())) {
                        schedHours = 0.0;
                    }
                }
                todayAvail = BigDecimal.valueOf(schedHours).setScale(2, RoundingMode.HALF_UP);
                double liveMin = todayLogsByEq.getOrDefault(eqId, Collections.emptyList()).stream()
                        .mapToDouble(l -> l.getDurationMinutes() != null ? l.getDurationMinutes() : 0).sum();
                todayUsed = BigDecimal.valueOf(liveMin / 60.0).setScale(2, RoundingMode.HALF_UP);
            }

            BigDecimal eqAvail = histAvail.add(todayAvail);
            BigDecimal eqUsed  = histUsed .add(todayUsed);
            BigDecimal eqIdle  = histIdle .add(eqAvail.subtract(eqUsed).max(BigDecimal.ZERO));
            BigDecimal eqPct   = eqAvail.compareTo(BigDecimal.ZERO) > 0
                    ? eqUsed.multiply(BigDecimal.valueOf(100)).divide(eqAvail, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            totalUsed  += eqUsed .doubleValue();
            totalAvail += eqAvail.doubleValue();
            totalIdle  += eqIdle .doubleValue();
            long eqBookings = bookingCountByEq.getOrDefault(eqId, 0L);
            totalBookings  += eqBookings;

            String status = classifyUtilization(eqPct.doubleValue());
            equipmentItems.add(UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto.builder()
                    .equipmentId(eqId)
                    .equipmentName(eq.getName())
                    .laboratoryId(eq.getLabId())
                    .laboratoryName(labNames.getOrDefault(eq.getLabId(), ""))
                    .departmentId(eq.getDepartmentId())
                    .departmentName(deptNames.getOrDefault(eq.getDepartmentId(), "Unknown"))
                    .usedHours(eqUsed.doubleValue())
                    .availableHours(eqAvail.doubleValue())
                    .idleHours(eqIdle.doubleValue())
                    .utilizationPercentage(eqPct.doubleValue())
                    .bookingCount(eqBookings)
                    .utilizationStatus(status)
                    .build());
        }

        double avgUtil = totalAvail > 0
                ? BigDecimal.valueOf(totalUsed * 100.0 / totalAvail).setScale(2, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        UtilizationEffectivenessReportDto.UtilizationSummaryDto summary =
                UtilizationEffectivenessReportDto.UtilizationSummaryDto.builder()
                        .averageUtilizationPercentage(avgUtil)
                        .totalUsedHours(round2(totalUsed))
                        .totalAvailableHours(round2(totalAvail))
                        .totalIdleHours(round2(totalIdle))
                        .totalEquipmentCount((long) authorized.size())
                        .totalLaboratoryCount((long) labSet.size())
                        .totalBookingCount(totalBookings)
                        .build();

        // ── 7. Most / Least utilized ─────────────────────────────────────────
        List<UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto> sortedItems =
                equipmentItems.stream()
                        .sorted(Comparator.comparingDouble(UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto::getUtilizationPercentage).reversed())
                        .toList();

        UtilizationEffectivenessReportDto.EquipmentUtilizationRankDto mostUtil = null;
        UtilizationEffectivenessReportDto.EquipmentUtilizationRankDto leastUtil = null;
        if (!sortedItems.isEmpty()) {
            UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto first = sortedItems.get(0);
            mostUtil = UtilizationEffectivenessReportDto.EquipmentUtilizationRankDto.builder()
                    .equipmentId(first.getEquipmentId()).equipmentName(first.getEquipmentName())
                    .laboratoryId(first.getLaboratoryId()).laboratoryName(first.getLaboratoryName())
                    .departmentId(first.getDepartmentId()).departmentName(first.getDepartmentName())
                    .utilizationPercentage(first.getUtilizationPercentage())
                    .usedHours(first.getUsedHours()).availableHours(first.getAvailableHours()).build();

            UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto last = sortedItems.get(sortedItems.size() - 1);
            leastUtil = UtilizationEffectivenessReportDto.EquipmentUtilizationRankDto.builder()
                    .equipmentId(last.getEquipmentId()).equipmentName(last.getEquipmentName())
                    .laboratoryId(last.getLaboratoryId()).laboratoryName(last.getLaboratoryName())
                    .departmentId(last.getDepartmentId()).departmentName(last.getDepartmentName())
                    .utilizationPercentage(last.getUtilizationPercentage())
                    .usedHours(last.getUsedHours()).availableHours(last.getAvailableHours()).build();
        }

        List<UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto> underutilized =
                equipmentItems.stream().filter(e -> e.getUtilizationPercentage() < 30.0).toList();
        List<UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto> highlyUtilized =
                equipmentItems.stream().filter(e -> e.getUtilizationPercentage() >= 70.0).toList();

        // ── 8. Trend (daily or monthly) ───────────────────────────────────────
        long rangeDays = actualFrom.until(actualTo, java.time.temporal.ChronoUnit.DAYS);
        boolean dailyTrend = rangeDays <= 31;
        List<UtilizationEffectivenessReportDto.UtilizationTrendPointDto> trend = new ArrayList<>();

        if (dailyTrend) {
            // Group metrics by date
            Map<LocalDate, List<UtilizationMetric>> metricsByDate = metrics.stream()
                    .collect(Collectors.groupingBy(UtilizationMetric::getPeriodDate));
            LocalDate cursor = actualFrom;
            while (!cursor.isAfter(actualTo)) {
                final LocalDate d = cursor;
                List<UtilizationMetric> dayMetrics = metricsByDate.getOrDefault(d, Collections.emptyList());
                double dUsed = dayMetrics.stream().mapToDouble(m -> nvl(m.getTotalUsedHours()).doubleValue()).sum();
                double dAvail = dayMetrics.stream().mapToDouble(m -> nvl(m.getTotalAvailableHours()).doubleValue()).sum();
                double dIdle  = dayMetrics.stream().mapToDouble(m -> nvl(m.getIdleTimeHours()).doubleValue()).sum();
                // Add live data for today
                if (d.equals(LocalDate.now()) && includesToday) {
                    for (Long eqId : eqIds) {
                        dUsed  += todayLogsByEq.getOrDefault(eqId, Collections.emptyList()).stream()
                                .mapToDouble(l -> l.getDurationMinutes() != null ? l.getDurationMinutes() / 60.0 : 0).sum();
                    }
                }
                double dPct = dAvail > 0 ? round2(dUsed * 100.0 / dAvail) : 0.0;
                trend.add(UtilizationEffectivenessReportDto.UtilizationTrendPointDto.builder()
                        .period(d.toString())
                        .usedHours(round2(dUsed)).availableHours(round2(dAvail)).idleHours(round2(dIdle))
                        .utilizationPercentage(dPct)
                        .build());
                cursor = cursor.plusDays(1);
            }
        } else {
            // Monthly aggregation
            Map<YearMonth, List<UtilizationMetric>> metricsByMonth = metrics.stream()
                    .collect(Collectors.groupingBy(m -> YearMonth.from(m.getPeriodDate())));
            YearMonth cursorMonth = YearMonth.from(actualFrom);
            YearMonth endMonth    = YearMonth.from(actualTo);
            while (!cursorMonth.isAfter(endMonth)) {
                List<UtilizationMetric> monthMetrics = metricsByMonth.getOrDefault(cursorMonth, Collections.emptyList());
                double mUsed  = monthMetrics.stream().mapToDouble(m -> nvl(m.getTotalUsedHours()).doubleValue()).sum();
                double mAvail = monthMetrics.stream().mapToDouble(m -> nvl(m.getTotalAvailableHours()).doubleValue()).sum();
                double mIdle  = monthMetrics.stream().mapToDouble(m -> nvl(m.getIdleTimeHours()).doubleValue()).sum();
                double mPct   = mAvail > 0 ? round2(mUsed * 100.0 / mAvail) : 0.0;
                trend.add(UtilizationEffectivenessReportDto.UtilizationTrendPointDto.builder()
                        .period(cursorMonth.toString())
                        .usedHours(round2(mUsed)).availableHours(round2(mAvail)).idleHours(round2(mIdle))
                        .utilizationPercentage(mPct)
                        .build());
                cursorMonth = cursorMonth.plusMonths(1);
            }
        }

        // ── 9. Department comparison (INSTITUTION_ADMIN only) ─────────────────
        List<UtilizationEffectivenessReportDto.DepartmentUtilizationComparisonDto> deptComparison = null;
        if (isInstAdmin) {
            Map<Long, List<UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto>> byDept =
                    equipmentItems.stream().collect(Collectors.groupingBy(
                            UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto::getDepartmentId));
            deptComparison = new ArrayList<>();
            for (Map.Entry<Long, List<UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto>> entry : byDept.entrySet()) {
                Long dId = entry.getKey();
                List<UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto> dItems = entry.getValue();
                double dUsed  = dItems.stream().mapToDouble(UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto::getUsedHours).sum();
                double dAvail = dItems.stream().mapToDouble(UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto::getAvailableHours).sum();
                double dIdle  = dItems.stream().mapToDouble(UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto::getIdleHours).sum();
                double dPct   = dAvail > 0 ? round2(dUsed * 100.0 / dAvail) : 0.0;
                long dLabCount = dItems.stream().map(UtilizationEffectivenessReportDto.EquipmentUtilizationItemDto::getLaboratoryId)
                        .filter(Objects::nonNull).distinct().count();
                deptComparison.add(UtilizationEffectivenessReportDto.DepartmentUtilizationComparisonDto.builder()
                        .departmentId(dId).departmentName(deptNames.getOrDefault(dId, "Unknown"))
                        .equipmentCount((long) dItems.size()).laboratoryCount(dLabCount)
                        .usedHours(round2(dUsed)).availableHours(round2(dAvail)).idleHours(round2(dIdle))
                        .utilizationPercentage(dPct)
                        .build());
            }
        }

        // ── 10. Resolve institution/department/lab names for metadata ─────────
        Institution inst = institutionRepository.findById(userInstId != null ? userInstId : -1L).orElse(null);
        Department dept  = (userDeptId != null)
                ? departmentRepository.findById(userDeptId).orElse(null) : null;
        Laboratory lab   = (filterLaboratoryId != null)
                ? laboratoryRepository.findById(filterLaboratoryId).orElse(null) : null;

        ReportMetadataDto metadata = ReportMetadataDto.builder()
                .reportType("UTILIZATION_EFFECTIVENESS")
                .generatedAt(LocalDateTime.now())
                .from(actualFrom)
                .to(actualTo)
                .institutionId(userInstId)
                .institutionName(inst != null ? inst.getName() : null)
                .departmentId(isInstAdmin ? filterDepartmentId : userDeptId)
                .departmentName(dept != null ? dept.getName() : null)
                .laboratoryId(filterLaboratoryId)
                .laboratoryName(lab != null ? lab.getName() : null)
                .generatedByUserId(principal.getUserId())
                .generatedByRole(roles.isEmpty() ? null : roles.get(0))
                .build();

        return UtilizationEffectivenessReportDto.builder()
                .metadata(metadata)
                .summary(summary)
                .mostUtilizedEquipment(mostUtil)
                .leastUtilizedEquipment(leastUtil)
                .equipmentUtilization(equipmentItems)
                .utilizationTrend(trend)
                .underutilizedEquipment(underutilized)
                .highlyUtilizedEquipment(highlyUtilized)
                .departmentComparison(deptComparison)
                .build();
    }

    // ─── MILESTONE 3 — PHASE 1: COST ANALYSIS REPORT ─────────────────────────

    /**
     * Returns a structured cost analysis report for the authorized scope.
     *
     * Authorization:
     *  - LAB_MANAGER / DEPARTMENT_HEAD → own department only
     *  - INSTITUTION_ADMIN → full institution; departmentComparison populated
     *  - SYSTEM_ADMIN → not included in this endpoint
     *
     * Monthly trend uses per-category breakdown from CostRecord.createdAt.
     * Budget info from BudgetRepository using the current or resolved fiscal year.
     * Cost categories: USAGE, MAINTENANCE, SHARING_FEE, DAMAGE_CHARGE.
     */
    public CostAnalysisReportDto getCostAnalysisReport(
            UserPrincipal principal,
            LocalDate from,
            LocalDate to,
            Long filterDepartmentId,
            String fiscalYearParam) {

        validateDates(from, to);
        LocalDate actualFrom = from != null ? from : LocalDate.now().minusDays(30);
        LocalDate actualTo   = to   != null ? to   : LocalDate.now();

        List<String> roles  = principal.getRoleNames();
        Long userInstId     = principal.getInstitutionId();
        Long userDeptId     = principal.getDepartmentId();
        boolean isInstAdmin = roles.contains(Role.INSTITUTION_ADMIN) || roles.contains("ROLE_INSTITUTION_ADMIN");

        String fiscalYear = (fiscalYearParam != null && !fiscalYearParam.isBlank())
                ? fiscalYearParam : FiscalYearUtil.getCurrentFiscalYear();

        LocalDateTime fromDt = actualFrom.atStartOfDay();
        LocalDateTime toDt   = actualTo.atTime(23, 59, 59);

        // ── 1. Fetch cost records scoped to caller's institution or department ──
        List<CostRecord> rawCosts;
        if (isInstAdmin) {
            rawCosts = costRecordRepository.findByInstitutionIdAndCreatedAtBetween(userInstId, fromDt, toDt);
            // Filter to a specific department if requested
            if (filterDepartmentId != null) {
                // Validate the requested department belongs to this institution
                Department filterDept = departmentRepository.findById(filterDepartmentId)
                        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Department not found."));
                if (!userInstId.equals(filterDept.getInstitutionId())) {
                    throw new ApiException(HttpStatus.FORBIDDEN, "Access denied. Department does not belong to your institution.");
                }
                rawCosts = rawCosts.stream()
                        .filter(c -> filterDepartmentId.equals(c.getDepartmentId()))
                        .toList();
            }
        } else {
            // LAB_MANAGER / DEPARTMENT_HEAD — scoped to own department
            if (userDeptId == null) {
                rawCosts = Collections.emptyList();
            } else {
                rawCosts = costRecordRepository.findByDepartmentIdAndCreatedAtBetween(userDeptId, fromDt, toDt);
                // Additional institution-guard: discard any record not belonging to caller's institution
                rawCosts = rawCosts.stream()
                        .filter(c -> userInstId == null || userInstId.equals(c.getInstitutionId()))
                        .toList();
            }
        }

        // ── 2. Cost breakdown totals ─────────────────────────────────────────
        BigDecimal usageCost = BigDecimal.ZERO, maintCost = BigDecimal.ZERO,
                   sharingFee = BigDecimal.ZERO, damageCh = BigDecimal.ZERO;
        for (CostRecord c : rawCosts) {
            BigDecimal amt = c.getAmount() != null ? c.getAmount() : BigDecimal.ZERO;
            switch (c.getCostType()) {
                case "USAGE"         -> usageCost  = usageCost .add(amt);
                case "MAINTENANCE"   -> maintCost  = maintCost .add(amt);
                case "SHARING_FEE"   -> sharingFee = sharingFee.add(amt);
                case "DAMAGE_CHARGE" -> damageCh   = damageCh  .add(amt);
                default              -> usageCost  = usageCost .add(amt); // fallback
            }
        }
        BigDecimal totalCost = usageCost.add(maintCost).add(sharingFee).add(damageCh);

        CostAnalysisReportDto.CostSummaryBreakdownDto costSummary =
                CostAnalysisReportDto.CostSummaryBreakdownDto.builder()
                        .totalCost(totalCost).usageCost(usageCost).maintenanceCost(maintCost)
                        .sharingFee(sharingFee).damageCharge(damageCh)
                        .totalCostsCount((long) rawCosts.size())
                        .build();

        // ── 3. Budget info ───────────────────────────────────────────────────
        CostAnalysisReportDto.BudgetReportSummaryDto budgetSummary = null;
        if (isInstAdmin && filterDepartmentId == null) {
            // Aggregate all department budgets for the institution
            List<Budget> instBudgets = budgetRepository.findByInstitutionIdAndFiscalYear(userInstId, fiscalYear);
            BigDecimal totalAlloc = instBudgets.stream().map(Budget::getAllocatedAmount)
                    .filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalUsed  = instBudgets.stream().map(Budget::getUsedAmount)
                    .filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalRem   = totalAlloc.subtract(totalUsed).max(BigDecimal.ZERO);
            BigDecimal usedPct    = totalAlloc.compareTo(BigDecimal.ZERO) > 0
                    ? totalUsed.multiply(BigDecimal.valueOf(100)).divide(totalAlloc, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            String warnStatus = budgetWarningStatus(usedPct.doubleValue());
            budgetSummary = CostAnalysisReportDto.BudgetReportSummaryDto.builder()
                    .fiscalYear(fiscalYear).allocatedAmount(totalAlloc).usedAmount(totalUsed)
                    .remainingAmount(totalRem).usedPercentage(usedPct).warningStatus(warnStatus).build();
        } else {
            Long deptForBudget = isInstAdmin ? filterDepartmentId : userDeptId;
            if (deptForBudget != null) {
                Optional<Budget> budgetOpt = budgetRepository.findByDepartmentIdAndFiscalYear(deptForBudget, fiscalYear);
                if (budgetOpt.isPresent()) {
                    Budget b = budgetOpt.get();
                    BigDecimal alloc = nvlBD(b.getAllocatedAmount());
                    BigDecimal used  = nvlBD(b.getUsedAmount());
                    BigDecimal rem   = nvlBD(b.getRemainingAmount());
                    BigDecimal usedPct = alloc.compareTo(BigDecimal.ZERO) > 0
                            ? used.multiply(BigDecimal.valueOf(100)).divide(alloc, 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    budgetSummary = CostAnalysisReportDto.BudgetReportSummaryDto.builder()
                            .fiscalYear(fiscalYear).allocatedAmount(alloc).usedAmount(used)
                            .remainingAmount(rem).usedPercentage(usedPct)
                            .warningStatus(budgetWarningStatus(usedPct.doubleValue())).build();
                }
            }
        }

        // ── 4. Monthly cost trend (per-category breakdown) ────────────────────
        Map<String, Map<String, BigDecimal>> monthlyByCategory = new LinkedHashMap<>();
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("yyyy-MM");
        for (CostRecord c : rawCosts) {
            if (c.getCreatedAt() == null) continue;
            String monthKey = YearMonth.from(c.getCreatedAt()).format(monthFmt);
            monthlyByCategory.computeIfAbsent(monthKey, k -> new HashMap<>());
            Map<String, BigDecimal> catMap = monthlyByCategory.get(monthKey);
            String cat = c.getCostType() != null ? c.getCostType() : "USAGE";
            catMap.merge(cat, c.getAmount() != null ? c.getAmount() : BigDecimal.ZERO, BigDecimal::add);
        }
        // Fill months in range that had no costs
        YearMonth cursorMonth = YearMonth.from(actualFrom);
        YearMonth endMonth    = YearMonth.from(actualTo);
        while (!cursorMonth.isAfter(endMonth)) {
            monthlyByCategory.putIfAbsent(cursorMonth.format(monthFmt), new HashMap<>());
            cursorMonth = cursorMonth.plusMonths(1);
        }
        List<CostAnalysisReportDto.MonthlyCostTrendPointDto> monthlyTrend = monthlyByCategory.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, BigDecimal> cat = e.getValue();
                    BigDecimal u  = cat.getOrDefault("USAGE", BigDecimal.ZERO);
                    BigDecimal m  = cat.getOrDefault("MAINTENANCE", BigDecimal.ZERO);
                    BigDecimal sf = cat.getOrDefault("SHARING_FEE", BigDecimal.ZERO);
                    BigDecimal dc = cat.getOrDefault("DAMAGE_CHARGE", BigDecimal.ZERO);
                    return CostAnalysisReportDto.MonthlyCostTrendPointDto.builder()
                            .period(e.getKey()).usageCost(u).maintenanceCost(m).sharingFee(sf).damageCharge(dc)
                            .totalCost(u.add(m).add(sf).add(dc)).build();
                }).toList();

        // ── 5. Equipment cost breakdown ───────────────────────────────────────
        Map<Long, String> deptNames = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(Department::getDepartmentId, Department::getName, (a, b) -> a));
        List<Laboratory> allLabs = isInstAdmin
                ? laboratoryRepository.findByInstitutionIdAndIsActiveTrue(userInstId)
                : laboratoryRepository.findByDepartmentId(userDeptId != null ? userDeptId : -1L);
        Map<Long, String> labNames = allLabs.stream()
                .collect(Collectors.toMap(Laboratory::getLabId, Laboratory::getName, (a, b) -> a));

        List<Equipment> authorizedEquip = getAuthorizedEquipment(principal, filterDepartmentId);
        Map<Long, Equipment> eqMap = authorizedEquip.stream()
                .collect(Collectors.toMap(Equipment::getEquipmentId, e -> e, (a, b) -> a));

        Map<Long, Map<String, BigDecimal>> costByEq = new HashMap<>();
        for (CostRecord c : rawCosts) {
            if (!eqMap.containsKey(c.getEquipmentId())) continue;
            costByEq.computeIfAbsent(c.getEquipmentId(), k -> new HashMap<>());
            String cat = c.getCostType() != null ? c.getCostType() : "USAGE";
            costByEq.get(c.getEquipmentId()).merge(cat, c.getAmount() != null ? c.getAmount() : BigDecimal.ZERO, BigDecimal::add);
        }
        List<CostAnalysisReportDto.EquipmentCostItemDto> equipmentCosts = costByEq.entrySet().stream()
                .map(e -> {
                    Equipment eq = eqMap.get(e.getKey());
                    Map<String, BigDecimal> cat = e.getValue();
                    BigDecimal u  = cat.getOrDefault("USAGE", BigDecimal.ZERO);
                    BigDecimal m  = cat.getOrDefault("MAINTENANCE", BigDecimal.ZERO);
                    BigDecimal sf = cat.getOrDefault("SHARING_FEE", BigDecimal.ZERO);
                    BigDecimal dc = cat.getOrDefault("DAMAGE_CHARGE", BigDecimal.ZERO);
                    return CostAnalysisReportDto.EquipmentCostItemDto.builder()
                            .equipmentId(eq.getEquipmentId()).equipmentName(eq.getName())
                            .laboratoryId(eq.getLabId()).laboratoryName(labNames.getOrDefault(eq.getLabId(), ""))
                            .departmentId(eq.getDepartmentId()).departmentName(deptNames.getOrDefault(eq.getDepartmentId(), "Unknown"))
                            .usageCost(u).maintenanceCost(m).sharingFee(sf).damageCharge(dc)
                            .totalCost(u.add(m).add(sf).add(dc)).build();
                })
                .sorted(Comparator.comparing(CostAnalysisReportDto.EquipmentCostItemDto::getTotalCost).reversed())
                .toList();

        // ── 6. Laboratory cost breakdown ──────────────────────────────────────
        Map<Long, Map<String, BigDecimal>> costByLab = new HashMap<>();
        for (CostRecord c : rawCosts) {
            Equipment eq = eqMap.get(c.getEquipmentId());
            if (eq == null || eq.getLabId() == null) continue;
            costByLab.computeIfAbsent(eq.getLabId(), k -> new HashMap<>());
            String cat = c.getCostType() != null ? c.getCostType() : "USAGE";
            costByLab.get(eq.getLabId()).merge(cat, c.getAmount() != null ? c.getAmount() : BigDecimal.ZERO, BigDecimal::add);
        }
        List<CostAnalysisReportDto.LaboratoryCostItemDto> laboratoryCosts = costByLab.entrySet().stream()
                .map(e -> {
                    Map<String, BigDecimal> cat = e.getValue();
                    BigDecimal u  = cat.getOrDefault("USAGE", BigDecimal.ZERO);
                    BigDecimal m  = cat.getOrDefault("MAINTENANCE", BigDecimal.ZERO);
                    BigDecimal sf = cat.getOrDefault("SHARING_FEE", BigDecimal.ZERO);
                    BigDecimal dc = cat.getOrDefault("DAMAGE_CHARGE", BigDecimal.ZERO);
                    // Find department of lab (any equipment in this lab)
                    Long labDeptId = eqMap.values().stream()
                            .filter(eq -> e.getKey().equals(eq.getLabId()))
                            .map(Equipment::getDepartmentId).findFirst().orElse(null);
                    return CostAnalysisReportDto.LaboratoryCostItemDto.builder()
                            .laboratoryId(e.getKey()).laboratoryName(labNames.getOrDefault(e.getKey(), ""))
                            .departmentId(labDeptId).departmentName(deptNames.getOrDefault(labDeptId, "Unknown"))
                            .usageCost(u).maintenanceCost(m).sharingFee(sf).damageCharge(dc)
                            .totalCost(u.add(m).add(sf).add(dc)).build();
                })
                .sorted(Comparator.comparing(CostAnalysisReportDto.LaboratoryCostItemDto::getTotalCost).reversed())
                .toList();

        // ── 7. Maintenance cost items (MAINTENANCE-type CostRecords) ──────────
        List<Long> eqIdList = authorizedEquip.stream().map(Equipment::getEquipmentId).toList();
        List<MaintenanceRequest> maintRequests = eqIdList.isEmpty() ? Collections.emptyList()
                : maintenanceRequestRepository.findByEquipmentIdIn(eqIdList);
        Map<Long, MaintenanceRequest> maintMap = maintRequests.stream()
                .collect(Collectors.toMap(MaintenanceRequest::getMaintenanceId, r -> r, (a, b) -> a));

        List<CostAnalysisReportDto.MaintenanceCostItemDto> maintenanceCosts = rawCosts.stream()
                .filter(c -> "MAINTENANCE".equals(c.getCostType()) && c.getMaintenanceId() != null)
                .filter(c -> eqMap.containsKey(c.getEquipmentId()))
                .map(c -> {
                    Equipment eq = eqMap.get(c.getEquipmentId());
                    MaintenanceRequest mr = maintMap.get(c.getMaintenanceId());
                    return CostAnalysisReportDto.MaintenanceCostItemDto.builder()
                            .maintenanceId(c.getMaintenanceId()).equipmentId(eq.getEquipmentId()).equipmentName(eq.getName())
                            .laboratoryId(eq.getLabId()).laboratoryName(labNames.getOrDefault(eq.getLabId(), ""))
                            .departmentId(eq.getDepartmentId()).departmentName(deptNames.getOrDefault(eq.getDepartmentId(), "Unknown"))
                            .maintenanceCost(c.getAmount())
                            .createdDate(c.getCreatedAt())
                            .status(mr != null ? mr.getStatus() : "UNKNOWN")
                            .build();
                })
                .sorted(Comparator.comparing(CostAnalysisReportDto.MaintenanceCostItemDto::getMaintenanceCost,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        // ── 8. Sharing cost items (SHARING_FEE-type CostRecords) ──────────────
        List<Long> agreementIds = rawCosts.stream()
                .filter(c -> "SHARING_FEE".equals(c.getCostType()) && c.getSharingAgreementId() != null)
                .map(CostRecord::getSharingAgreementId).distinct().toList();
        List<SharingAgreement> agreements = agreementIds.isEmpty() ? Collections.emptyList()
                : sharingAgreementRepository.findByEquipmentIdIn(eqIdList).stream()
                        .filter(a -> agreementIds.contains(a.getAgreementId())).toList();
        Map<Long, SharingAgreement> agreementMap = agreements.stream()
                .collect(Collectors.toMap(SharingAgreement::getAgreementId, a -> a, (a, b) -> a));
        Map<Long, String> instNames = institutionRepository.findAll().stream()
                .collect(Collectors.toMap(Institution::getInstitutionId, Institution::getName, (a, b) -> a));

        List<CostAnalysisReportDto.SharingCostItemDto> sharingCosts = rawCosts.stream()
                .filter(c -> "SHARING_FEE".equals(c.getCostType()) && c.getSharingAgreementId() != null)
                .filter(c -> eqMap.containsKey(c.getEquipmentId()))
                .map(c -> {
                    SharingAgreement ag = agreementMap.get(c.getSharingAgreementId());
                    Equipment eq = eqMap.get(c.getEquipmentId());
                    Long ownerInst = ag != null ? ag.getOwningInstitutionId() : null;
                    Long reqInst   = ag != null ? ag.getRequestingInstitutionId() : null;
                    return CostAnalysisReportDto.SharingCostItemDto.builder()
                            .agreementId(c.getSharingAgreementId())
                            .owningInstitutionId(ownerInst)
                            .owningInstitution(instNames.getOrDefault(ownerInst, ""))
                            .requestingInstitutionId(reqInst)
                            .requestingInstitution(instNames.getOrDefault(reqInst, ""))
                            .equipmentName(eq.getName())
                            .billingPeriod(c.getBillingPeriod())
                            .sharingFee(c.getAmount())
                            .invoiceStatus("N/A")
                            .paymentStatus("N/A")
                            .build();
                })
                .toList();

        // ── 9. Department comparison (INSTITUTION_ADMIN only) ─────────────────
        List<CostAnalysisReportDto.DepartmentCostComparisonDto> deptComparison = null;
        if (isInstAdmin && filterDepartmentId == null) {
            // Re-fetch all costs for institution (no dept filter) for full comparison
            List<CostRecord> allInstCosts = costRecordRepository.findByInstitutionIdAndCreatedAtBetween(userInstId, fromDt, toDt);
            Map<Long, List<CostRecord>> byDeptId = allInstCosts.stream().collect(Collectors.groupingBy(CostRecord::getDepartmentId));
            List<Budget> instBudgets = budgetRepository.findByInstitutionIdAndFiscalYear(userInstId, fiscalYear);
            Map<Long, Budget> budgetByDept = instBudgets.stream()
                    .filter(b -> b.getDepartmentId() != null)
                    .collect(Collectors.toMap(Budget::getDepartmentId, b -> b, (a, b) -> a));

            deptComparison = new ArrayList<>();
            for (Map.Entry<Long, List<CostRecord>> entry : byDeptId.entrySet()) {
                Long dId = entry.getKey();
                List<CostRecord> dCosts = entry.getValue();
                BigDecimal dUsage = BigDecimal.ZERO, dMaint = BigDecimal.ZERO, dSF = BigDecimal.ZERO, dDC = BigDecimal.ZERO;
                for (CostRecord c : dCosts) {
                    BigDecimal amt = c.getAmount() != null ? c.getAmount() : BigDecimal.ZERO;
                    switch (c.getCostType()) {
                        case "USAGE"         -> dUsage = dUsage.add(amt);
                        case "MAINTENANCE"   -> dMaint = dMaint.add(amt);
                        case "SHARING_FEE"   -> dSF    = dSF   .add(amt);
                        case "DAMAGE_CHARGE" -> dDC    = dDC   .add(amt);
                        default              -> dUsage = dUsage.add(amt);
                    }
                }
                BigDecimal dTotal = dUsage.add(dMaint).add(dSF).add(dDC);
                Budget db = budgetByDept.get(dId);
                BigDecimal bAlloc = db != null ? nvlBD(db.getAllocatedAmount()) : BigDecimal.ZERO;
                BigDecimal bUsed  = db != null ? nvlBD(db.getUsedAmount())      : BigDecimal.ZERO;
                BigDecimal bRem   = db != null ? nvlBD(db.getRemainingAmount())  : BigDecimal.ZERO;
                BigDecimal bPct   = bAlloc.compareTo(BigDecimal.ZERO) > 0
                        ? bUsed.multiply(BigDecimal.valueOf(100)).divide(bAlloc, 2, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;
                deptComparison.add(CostAnalysisReportDto.DepartmentCostComparisonDto.builder()
                        .departmentId(dId).departmentName(deptNames.getOrDefault(dId, "Unknown"))
                        .totalCost(dTotal).usageCost(dUsage).maintenanceCost(dMaint).sharingFee(dSF).damageCharge(dDC)
                        .budgetAllocated(bAlloc).budgetUsed(bUsed).budgetRemaining(bRem).budgetUtilizationPercentage(bPct)
                        .build());
            }
        }

        // ── 10. Metadata ──────────────────────────────────────────────────────
        Institution inst = institutionRepository.findById(userInstId != null ? userInstId : -1L).orElse(null);
        Department dept  = !isInstAdmin && userDeptId != null
                ? departmentRepository.findById(userDeptId).orElse(null)
                : (filterDepartmentId != null ? departmentRepository.findById(filterDepartmentId).orElse(null) : null);

        ReportMetadataDto metadata = ReportMetadataDto.builder()
                .reportType("COST_ANALYSIS")
                .generatedAt(LocalDateTime.now())
                .from(actualFrom)
                .to(actualTo)
                .institutionId(userInstId)
                .institutionName(inst != null ? inst.getName() : null)
                .departmentId(isInstAdmin ? filterDepartmentId : userDeptId)
                .departmentName(dept != null ? dept.getName() : null)
                .laboratoryId(null)
                .laboratoryName(null)
                .generatedByUserId(principal.getUserId())
                .generatedByRole(roles.isEmpty() ? null : roles.get(0))
                .build();

        return CostAnalysisReportDto.builder()
                .metadata(metadata).summary(costSummary).budget(budgetSummary)
                .monthlyTrend(monthlyTrend).equipmentCosts(equipmentCosts)
                .laboratoryCosts(laboratoryCosts).maintenanceCosts(maintenanceCosts)
                .sharingCosts(sharingCosts).departmentComparison(deptComparison)
                .build();
    }

    // ─── Shared Helper Utilities ──────────────────────────────────────────────

    private static BigDecimal nvl(BigDecimal val) {
        return val != null ? val : BigDecimal.ZERO;
    }

    private static BigDecimal nvlBD(BigDecimal val) {
        return val != null ? val : BigDecimal.ZERO;
    }

    private static double round2(double v) {
        return BigDecimal.valueOf(v).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private static String classifyUtilization(double pct) {
        if (pct < 30.0) return "LOW";
        if (pct <= 50.0) return "MODERATE";
        if (pct < 70.0) return "GOOD";
        return "HIGH";
    }

    private static String budgetWarningStatus(double usedPct) {
        if (usedPct >= 100.0) return "EXCEEDED";
        if (usedPct >= 90.0)  return "CRITICAL";
        if (usedPct >= 75.0)  return "WARNING";
        if (usedPct >= 50.0)  return "WATCH";
        return "NORMAL";
    }

    // ─── Simple Multipart Mock Implementation ──────────────────────────


    private static class SimpleMultipartFile implements MultipartFile {
        private final byte[] content;
        private final String name;
        private final String contentType;

        public SimpleMultipartFile(byte[] content, String name, String contentType) {
            this.content = content;
            this.name = name;
            this.contentType = contentType;
        }

        @Override public String getName() { return name; }
        @Override public String getOriginalFilename() { return name; }
        @Override public String getContentType() { return contentType; }
        @Override public boolean isEmpty() { return content == null || content.length == 0; }
        @Override public long getSize() { return content.length; }
        @Override public byte[] getBytes() throws IOException { return content; }
        @Override public InputStream getInputStream() throws IOException { return new ByteArrayInputStream(content); }
        @Override public void transferTo(File dest) throws IOException, IllegalStateException {
            try (FileOutputStream fos = new FileOutputStream(dest)) {
                fos.write(content);
            }
        }
    }
}
