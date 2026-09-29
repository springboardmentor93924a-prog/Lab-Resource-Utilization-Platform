package com.labresource.backend.systemadmin.service;

import com.labresource.backend.audit.repository.AuditLogRepository;
import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.booking.entity.Booking;
import com.labresource.backend.booking.repository.BookingRepository;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.institution.entity.Institution;
import com.labresource.backend.institution.repository.InstitutionRepository;
import com.labresource.backend.laboratory.entity.Laboratory;
import com.labresource.backend.laboratory.repository.LaboratoryRepository;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.systemadmin.dto.PlatformAnalyticsDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemAdminAnalyticsService {

    private final InstitutionRepository institutionRepository;
    private final AppUserRepository appUserRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public PlatformAnalyticsDto getPlatformAnalytics() {
        // 1. Institution Statistics
        List<Institution> allInstitutions = institutionRepository.findAll();
        long totalInst = allInstitutions.size();
        long approvedInst = allInstitutions.stream()
                .filter(i -> "APPROVED".equalsIgnoreCase(i.getApprovalStatus()) || Boolean.TRUE.equals(i.getIsActive()))
                .count();
        long pendingInst = allInstitutions.stream()
                .filter(i -> "PENDING".equalsIgnoreCase(i.getApprovalStatus()))
                .count();
        long rejectedInst = allInstitutions.stream()
                .filter(i -> "REJECTED".equalsIgnoreCase(i.getApprovalStatus()))
                .count();
        long activeInst = allInstitutions.stream()
                .filter(i -> Boolean.TRUE.equals(i.getIsActive()))
                .count();
        long inactiveInst = totalInst - activeInst;

        PlatformAnalyticsDto.InstitutionStatsDto instStats = new PlatformAnalyticsDto.InstitutionStatsDto(
                totalInst, approvedInst, pendingInst, rejectedInst, activeInst, inactiveInst
        );

        // Map institution id -> institution name for quick lookup
        Map<Long, String> instNameMap = allInstitutions.stream()
                .collect(Collectors.toMap(Institution::getInstitutionId, Institution::getName, (a, b) -> a));

        // 2. User Statistics
        List<AppUser> allUsers = appUserRepository.findAll();
        long totalUsers = allUsers.size();
        long activeUsers = allUsers.stream().filter(u -> Boolean.TRUE.equals(u.getIsActive())).count();
        long inactiveUsers = totalUsers - activeUsers;

        Map<String, Long> usersByRole = new HashMap<>();
        for (AppUser u : allUsers) {
            String roleName = u.getRoles().stream().findFirst().map(Role::getRoleName).orElse("RESEARCHER");
            usersByRole.put(roleName, usersByRole.getOrDefault(roleName, 0L) + 1);
        }

        Map<String, Long> usersByInst = new HashMap<>();
        for (AppUser u : allUsers) {
            String instName = u.getInstitutionId() != null ? instNameMap.getOrDefault(u.getInstitutionId(), "Platform Global") : "Platform Global";
            usersByInst.put(instName, usersByInst.getOrDefault(instName, 0L) + 1);
        }

        PlatformAnalyticsDto.UserStatsDto userStats = new PlatformAnalyticsDto.UserStatsDto(
                totalUsers, activeUsers, inactiveUsers, usersByRole, usersByInst
        );

        // 3. Laboratory Statistics
        List<Laboratory> allLabs = laboratoryRepository.findAll();
        long totalLabs = allLabs.size();
        Map<String, Long> labsByInst = new HashMap<>();
        for (Laboratory lab : allLabs) {
            String instName = lab.getInstitutionId() != null ? instNameMap.getOrDefault(lab.getInstitutionId(), "Unassigned") : "Unassigned";
            labsByInst.put(instName, labsByInst.getOrDefault(instName, 0L) + 1);
        }

        PlatformAnalyticsDto.LaboratoryStatsDto labStats = new PlatformAnalyticsDto.LaboratoryStatsDto(
                totalLabs, labsByInst
        );

        // 4. Equipment Statistics
        List<Equipment> allEquipment = equipmentRepository.findAll();
        long totalEq = allEquipment.size();
        Map<String, Long> eqByStatus = allEquipment.stream()
                .collect(Collectors.groupingBy(e -> e.getStatus() != null ? e.getStatus() : "UNKNOWN", Collectors.counting()));

        Map<String, Long> eqByInst = new HashMap<>();
        for (Equipment e : allEquipment) {
            String instName = e.getInstitutionId() != null ? instNameMap.getOrDefault(e.getInstitutionId(), "Unassigned") : "Unassigned";
            eqByInst.put(instName, eqByInst.getOrDefault(instName, 0L) + 1);
        }

        PlatformAnalyticsDto.EquipmentStatsDto eqStats = new PlatformAnalyticsDto.EquipmentStatsDto(
                totalEq, eqByStatus, eqByInst
        );

        // 5. Booking Statistics
        List<Booking> allBookings = bookingRepository.findAll();
        long totalBookings = allBookings.size();
        long confirmed = allBookings.stream().filter(b -> Booking.CONFIRMED.equalsIgnoreCase(b.getStatus())).count();
        long completed = allBookings.stream().filter(b -> Booking.COMPLETED.equalsIgnoreCase(b.getStatus())).count();
        long cancelled = allBookings.stream().filter(b -> Booking.CANCELLED.equalsIgnoreCase(b.getStatus())).count();
        long noShow = allBookings.stream().filter(b -> Booking.NO_SHOW.equalsIgnoreCase(b.getStatus())).count();
        long pendingAppr = allBookings.stream().filter(b -> Booking.PENDING_APPROVAL.equalsIgnoreCase(b.getStatus())).count();

        PlatformAnalyticsDto.BookingStatsDto bookingStats = new PlatformAnalyticsDto.BookingStatsDto(
                totalBookings, confirmed, completed, cancelled, noShow, pendingAppr
        );

        // 6. Activity / Audit Statistics
        var logs = auditLogRepository.findAll();
        long totalLogs = logs.size();
        Map<String, Long> actionCounts = logs.stream()
                .collect(Collectors.groupingBy(l -> l.getAction() != null ? l.getAction() : "OTHER", Collectors.counting()));

        PlatformAnalyticsDto.ActivityStatsDto activityStats = new PlatformAnalyticsDto.ActivityStatsDto(
                totalLogs, actionCounts
        );

        return new PlatformAnalyticsDto(instStats, userStats, labStats, eqStats, bookingStats, activityStats);
    }
}
