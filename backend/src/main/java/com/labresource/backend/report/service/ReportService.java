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
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
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

    // ─── Active Preservation of Old Endpoint Logic ──────────────────────

    @Transactional
    public Report generateReport(Long userId, Long institutionId, Long departmentId, String reportType, String format) throws IOException {
        String mockContent = "=== LAB RESOURCE UTILIZATION PLATFORM REPORT ===\n" +
                "Report Type: " + reportType.toUpperCase() + "\n" +
                "Format: " + format.toUpperCase() + "\n" +
                "Generated By User ID: " + userId + "\n" +
                "Institution ID: " + institutionId + "\n" +
                "Department ID: " + (departmentId != null ? departmentId : "All") + "\n" +
                "Generated At: " + java.time.LocalDateTime.now() + "\n" +
                "================================================\n" +
                "Data Summary: Mock data grid representing " + reportType.toLowerCase() + " analytics.";

        byte[] contentBytes = mockContent.getBytes(StandardCharsets.UTF_8);
        String extension = "pdf".equalsIgnoreCase(format) ? ".pdf" : ".xlsx";
        String fileName = reportType.toLowerCase() + "_report_" + System.currentTimeMillis() + extension;
        String contentType = "pdf".equalsIgnoreCase(format) ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        MultipartFile customFile = new SimpleMultipartFile(contentBytes, fileName, contentType);
        CloudinaryUploadResult uploadResult = storageService.upload(customFile, "reports");

        Report report = new Report();
        report.setGeneratedBy(userId);
        report.setReportType(reportType.toUpperCase());
        report.setInstitutionId(institutionId);
        report.setDepartmentId(departmentId);
        report.setCloudinaryPublicId(uploadResult.getPublicId());
        report.setCloudinarySecureUrl(uploadResult.getSecureUrl());
        report.setFileName(fileName);
        report.setContentType(contentType);
        report.setFormat(format.toUpperCase());

        return reportRepository.save(report);
    }

    public List<Report> getReports(Long institutionId, Long departmentId) {
        if (departmentId != null) {
            return reportRepository.findByDepartmentIdOrderByGeneratedAtDesc(departmentId);
        }
        return reportRepository.findByInstitutionIdOrderByGeneratedAtDesc(institutionId);
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
        } else if (roles.contains(Role.DEPARTMENT_HEAD) || roles.contains(Role.LAB_MANAGER)) {
            // Hard limit to user's registered department ID
            return equipmentRepository.findByDepartmentId(userDeptId);
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
            dto.setEquipmentName(eq.getName());
            dto.setEquipmentId(eqId);
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
            UserPrincipal principal, LocalDate from, LocalDate to) {

        // Validate Roles and get Department ID
        Long deptId = principal.getDepartmentId();
        if (deptId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Department Head must belong to a valid department.");
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
