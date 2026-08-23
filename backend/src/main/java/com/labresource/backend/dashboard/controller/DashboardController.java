package com.labresource.backend.dashboard.controller;

import com.labresource.backend.booking.entity.Booking;
import com.labresource.backend.booking.repository.BookingRepository;
import com.labresource.backend.calibration.repository.EquipmentCalibrationRepository;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.issuereport.entity.EquipmentIssueReport;
import com.labresource.backend.issuereport.repository.EquipmentIssueReportRepository;
import com.labresource.backend.maintenance.entity.MaintenanceRequest;
import com.labresource.backend.maintenance.repository.MaintenanceRequestRepository;
import com.labresource.backend.notification.repository.NotificationRepository;
import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.sharing.entity.ResourceSharingRequest;
import com.labresource.backend.sharing.repository.ResourceSharingRequestRepository;
import com.labresource.backend.waitlist.entity.Waitlist;
import com.labresource.backend.waitlist.repository.WaitlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final EquipmentIssueReportRepository issueReportRepository;
    private final NotificationRepository notificationRepository;
    private final WaitlistRepository waitlistRepository;
    private final ResourceSharingRequestRepository sharingRequestRepository;
    private final EquipmentCalibrationRepository calibrationRepository;

    // ─── Student Dashboard ─────────────────────────────────────────────────────

    @GetMapping("/student")
    @PreAuthorize("hasAnyAuthority('BOOK_EQUIPMENT', 'ROLE_STUDENT', 'ROLE_RESEARCHER')")
    public Map<String, Object> studentDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        Long userId = principal.getUserId();
        Map<String, Object> dashboard = new HashMap<>();

        // Upcoming bookings
        List<Booking> upcoming = bookingRepository.findByUserIdAndStatusInOrderByStartTimeAsc(
                userId, List.of(Booking.PENDING_APPROVAL, Booking.CONFIRMED));
        dashboard.put("upcomingBookings", upcoming.size());
        dashboard.put("upcomingBookingsList", upcoming);

        // Usage history
        List<Booking> history = bookingRepository.findByUserIdAndStatusInOrderByStartTimeDesc(
                userId, List.of(Booking.COMPLETED));
        dashboard.put("totalCompletedBookings", history.size());

        // Total usage cost
        BigDecimal totalUsageCost = history.stream()
                .map(b -> b.getActualCost() != null ? b.getActualCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dashboard.put("totalUsageCost", totalUsageCost);

        // Active waitlist entries
        List<Waitlist> waitlistEntries = waitlistRepository.findByUserIdAndStatusInOrderByPositionAsc(
                userId, List.of("WAITING"));
        dashboard.put("waitlistCount", waitlistEntries.size());
        dashboard.put("waitlistEntries", waitlistEntries);

        // Unread notifications
        dashboard.put("unreadNotifications", notificationRepository.countByUserIdAndIsReadFalse(userId));

        // Recent notifications (latest 10)
        dashboard.put("recentNotifications",
                notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().limit(10).toList());

        return dashboard;
    }

    // ─── Technician Dashboard ──────────────────────────────────────────────────

    @GetMapping("/technician")
    @PreAuthorize("hasAnyAuthority('VIEW_MAINTENANCE', 'ROLE_LAB_TECHNICIAN', 'ROLE_SYSTEM_ADMIN')")
    public Map<String, Object> technicianDashboard(@AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal.getUserId();
        Long deptId = principal.getDepartmentId();
        Map<String, Object> dashboard = new HashMap<>();

        // All work orders assigned to this technician
        List<MaintenanceRequest> allTasks = maintenanceRequestRepository.findByAssignedTechnicianId(userId);

        dashboard.put("assignedWorkOrders", allTasks.stream()
                .filter(m -> MaintenanceRequest.ASSIGNED.equals(m.getStatus())).count());
        dashboard.put("inProgressTasks", allTasks.stream()
                .filter(m -> MaintenanceRequest.IN_PROGRESS.equals(m.getStatus())).count());
        dashboard.put("pendingVerificationCount", allTasks.stream()
                .filter(m -> MaintenanceRequest.PENDING_VERIFICATION.equals(m.getStatus())).count());

        // Active tasks (ASSIGNED or IN_PROGRESS)
        dashboard.put("activeTasks", allTasks.stream()
                .filter(m -> MaintenanceRequest.ASSIGNED.equals(m.getStatus())
                        || MaintenanceRequest.IN_PROGRESS.equals(m.getStatus()))
                .toList());

        // Completed this month
        dashboard.put("completedThisMonth", allTasks.stream()
                .filter(m -> MaintenanceRequest.COMPLETED.equals(m.getStatus())
                        && m.getCompletedAt() != null
                        && m.getCompletedAt().getMonth() == LocalDateTime.now().getMonth())
                .count());

        // Equipment under maintenance in the technician's department
        if (deptId != null) {
            dashboard.put("deptEquipmentUnderMaintenance",
                    equipmentRepository.countByDepartmentIdAndStatus(deptId, Equipment.UNDER_MAINTENANCE));

            // Upcoming calibration alerts (within 30 days) for dept equipment
            LocalDate today = LocalDate.now();
            long calibrationAlerts = equipmentRepository.findByDepartmentId(deptId).stream()
                    .filter(e -> calibrationRepository.findByEquipmentIdOrderByNextDueDateDesc(e.getEquipmentId())
                            .stream().findFirst()
                            .map(c -> !c.getNextDueDate().isAfter(today.plusDays(30)))
                            .orElse(false))
                    .count();
            dashboard.put("pendingCalibrations", calibrationAlerts);
        }

        return dashboard;
    }

    // ─── Lab Manager Dashboard ─────────────────────────────────────────────────

    @GetMapping("/manager")
    @PreAuthorize("hasAnyAuthority('VIEW_MAINTENANCE', 'ROLE_LAB_MANAGER', 'ROLE_SYSTEM_ADMIN')")
    public Map<String, Object> managerDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        Long deptId = principal.getDepartmentId();
        Map<String, Object> dashboard = new HashMap<>();

        // Issue reports pending action
        List<EquipmentIssueReport> pendingReports = issueReportRepository
                .findByDepartmentIdAndStatusOrderByCreatedAtDesc(deptId, "OPEN");
        dashboard.put("pendingIssueReports", pendingReports.size());
        dashboard.put("pendingIssueReportsList", pendingReports);

        // Work orders
        List<MaintenanceRequest> workOrders = maintenanceRequestRepository
                .findByDepartmentIdOrderByCreatedAtDesc(deptId);
        Map<String, Long> workOrderByStatus = workOrders.stream()
                .collect(Collectors.groupingBy(MaintenanceRequest::getStatus, Collectors.counting()));
        dashboard.put("workOrderStatusBreakdown", workOrderByStatus);
        dashboard.put("activeWorkOrders", workOrders.stream()
                .filter(m -> !MaintenanceRequest.COMPLETED.equals(m.getStatus())
                        && !MaintenanceRequest.CANCELLED.equals(m.getStatus()))
                .count());
        dashboard.put("pendingVerification", workOrders.stream()
                .filter(m -> MaintenanceRequest.PENDING_VERIFICATION.equals(m.getStatus()))
                .toList());

        // Equipment overview
        List<Equipment> deptEquipment = equipmentRepository.findByDepartmentId(deptId);
        dashboard.put("totalEquipment", deptEquipment.size());
        dashboard.put("availableEquipment", deptEquipment.stream()
                .filter(e -> Equipment.AVAILABLE.equals(e.getStatus())).count());
        dashboard.put("underMaintenanceEquipment", deptEquipment.stream()
                .filter(e -> Equipment.UNDER_MAINTENANCE.equals(e.getStatus())).count());
        dashboard.put("outOfServiceEquipment", deptEquipment.stream()
                .filter(e -> Equipment.OUT_OF_SERVICE.equals(e.getStatus())).count());

        // Calibration alerts (within 30 days)
        LocalDate today = LocalDate.now();
        long calibrationAlerts = deptEquipment.stream()
                .filter(e -> calibrationRepository.findByEquipmentIdOrderByNextDueDateDesc(e.getEquipmentId())
                        .stream().findFirst()
                        .map(c -> !c.getNextDueDate().isAfter(today.plusDays(30)))
                        .orElse(false))
                .count();
        dashboard.put("calibrationAlertCount", calibrationAlerts);

        // Sharing requests for this department's equipment
        List<Long> deptEquipmentIds = deptEquipment.stream()
                .map(Equipment::getEquipmentId).toList();
        List<ResourceSharingRequest> sharingRequests = sharingRequestRepository
                .findByEquipmentIdIn(deptEquipmentIds);
        dashboard.put("pendingSharingRequests", sharingRequests.stream()
                .filter(r -> "PENDING".equals(r.getStatus())).count());

        return dashboard;
    }

    // ─── Department Head Dashboard ─────────────────────────────────────────────

    @GetMapping("/department-head")
    @PreAuthorize("hasAnyAuthority('ROLE_DEPARTMENT_HEAD', 'ROLE_SYSTEM_ADMIN')")
    public Map<String, Object> departmentHeadDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        // Department resolved from security principal — never from a query param
        Long deptId = principal.getDepartmentId();
        Map<String, Object> dashboard = new HashMap<>();

        List<Equipment> deptEquipment = equipmentRepository.findByDepartmentId(deptId);
        List<Long> deptEquipmentIds = deptEquipment.stream()
                .map(Equipment::getEquipmentId).toList();

        // Equipment overview
        dashboard.put("totalEquipment", deptEquipment.size());
        dashboard.put("availableEquipment", deptEquipment.stream()
                .filter(e -> Equipment.AVAILABLE.equals(e.getStatus())).count());
        dashboard.put("underMaintenanceEquipment", deptEquipment.stream()
                .filter(e -> Equipment.UNDER_MAINTENANCE.equals(e.getStatus())).count());
        dashboard.put("outOfServiceEquipment", deptEquipment.stream()
                .filter(e -> Equipment.OUT_OF_SERVICE.equals(e.getStatus())).count());

        // Booking stats
        long totalBookings = bookingRepository.countByEquipmentIdInAndStatus(deptEquipmentIds, Booking.COMPLETED)
                + bookingRepository.countByEquipmentIdInAndStatus(deptEquipmentIds, Booking.CANCELLED)
                + bookingRepository.countByEquipmentIdInAndStatus(deptEquipmentIds, Booking.NO_SHOW)
                + bookingRepository.countByEquipmentIdInAndStatus(deptEquipmentIds, Booking.IN_USE)
                + bookingRepository.countByEquipmentIdInAndStatus(deptEquipmentIds, Booking.CONFIRMED);
        long completedBookings = bookingRepository.countByEquipmentIdInAndStatus(deptEquipmentIds, Booking.COMPLETED);
        long noShowBookings = bookingRepository.countByEquipmentIdInAndStatus(deptEquipmentIds, Booking.NO_SHOW);
        dashboard.put("totalBookings", totalBookings);
        dashboard.put("completedBookings", completedBookings);
        dashboard.put("noShowBookings", noShowBookings);
        dashboard.put("noShowRate", totalBookings > 0
                ? Math.round((noShowBookings * 100.0 / totalBookings) * 100.0) / 100.0 : 0.0);

        // Maintenance & downtime
        List<MaintenanceRequest> maintenanceList = maintenanceRequestRepository
                .findByDepartmentIdOrderByCreatedAtDesc(deptId);
        BigDecimal totalDowntime = maintenanceList.stream()
                .filter(m -> m.getDowntimeHours() != null)
                .map(MaintenanceRequest::getDowntimeHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dashboard.put("totalDowntimeHours", totalDowntime);
        dashboard.put("maintenanceCount", maintenanceList.size());
        dashboard.put("activeMaintenanceCount", maintenanceList.stream()
                .filter(m -> !MaintenanceRequest.COMPLETED.equals(m.getStatus())
                        && !MaintenanceRequest.CANCELLED.equals(m.getStatus()))
                .count());

        // Dept usage cost (sum of actualCost on COMPLETED bookings)
        List<Booking> deptCompletedBookings = bookingRepository
                .findByEquipmentIdInAndStatus(deptEquipmentIds, Booking.COMPLETED);
        BigDecimal deptUsageCost = deptCompletedBookings.stream()
                .map(b -> b.getActualCost() != null ? b.getActualCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dashboard.put("departmentUsageCost", deptUsageCost);

        // Sharing requests
        List<ResourceSharingRequest> sharingRequests = sharingRequestRepository
                .findByEquipmentIdIn(deptEquipmentIds);
        dashboard.put("pendingSharingRequests", sharingRequests.stream()
                .filter(r -> "PENDING".equals(r.getStatus())).count());
        dashboard.put("activeSharingAgreements", sharingRequests.stream()
                .filter(r -> "APPROVED".equals(r.getStatus())).count());

        return dashboard;
    }

    // ─── Institution Admin Dashboard ───────────────────────────────────────────

    @GetMapping("/admin")
    @PreAuthorize("hasAnyAuthority('ROLE_INSTITUTION_ADMIN', 'ROLE_SYSTEM_ADMIN')")
    public Map<String, Object> adminDashboard(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        Long institutionId = principal.getInstitutionId();
        Map<String, Object> dashboard = new HashMap<>();

        List<Equipment> institutionEquipment = equipmentRepository.findByInstitutionId(institutionId);
        List<Long> institutionEquipmentIds = institutionEquipment.stream()
                .map(Equipment::getEquipmentId).toList();

        // Equipment overview
        dashboard.put("totalEquipment", institutionEquipment.size());
        dashboard.put("availableEquipment", institutionEquipment.stream()
                .filter(e -> Equipment.AVAILABLE.equals(e.getStatus())).count());
        dashboard.put("underMaintenanceEquipment", institutionEquipment.stream()
                .filter(e -> Equipment.UNDER_MAINTENANCE.equals(e.getStatus())).count());
        dashboard.put("outOfServiceEquipment", institutionEquipment.stream()
                .filter(e -> Equipment.OUT_OF_SERVICE.equals(e.getStatus())).count());

        // Total usage cost across the institution
        List<Booking> institutionCompletedBookings = bookingRepository
                .findByEquipmentIdInAndStatus(institutionEquipmentIds, Booking.COMPLETED);
        BigDecimal totalUsageCost = institutionCompletedBookings.stream()
                .map(b -> b.getActualCost() != null ? b.getActualCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dashboard.put("totalUsageCost", totalUsageCost);

        // Utilization rate
        long totalBookings = bookingRepository.countByEquipmentIdInAndStatus(institutionEquipmentIds, Booking.COMPLETED)
                + bookingRepository.countByEquipmentIdInAndStatus(institutionEquipmentIds, Booking.CANCELLED)
                + bookingRepository.countByEquipmentIdInAndStatus(institutionEquipmentIds, Booking.NO_SHOW);
        long completedBookings = bookingRepository.countByEquipmentIdInAndStatus(institutionEquipmentIds, Booking.COMPLETED);
        dashboard.put("totalBookings", totalBookings);
        dashboard.put("utilizationRate", totalBookings > 0
                ? Math.round((completedBookings * 100.0 / totalBookings) * 100.0) / 100.0 : 0.0);

        // Maintenance downtime
        List<MaintenanceRequest> allMaintenance = maintenanceRequestRepository.findAll().stream()
                .filter(m -> institutionEquipmentIds.contains(m.getEquipmentId()))
                .toList();
        BigDecimal totalDowntime = allMaintenance.stream()
                .filter(m -> m.getDowntimeHours() != null)
                .map(MaintenanceRequest::getDowntimeHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dashboard.put("totalDowntimeHours", totalDowntime);

        // Sharing statistics
        List<ResourceSharingRequest> sharingRequests = sharingRequestRepository
                .findByOwningInstitutionIdOrderByCreatedAtDesc(institutionId);
        dashboard.put("totalSharingRequests", sharingRequests.size());
        dashboard.put("activeSharingAgreements", sharingRequests.stream()
                .filter(r -> "APPROVED".equals(r.getStatus())).count());

        return dashboard;
    }
}
