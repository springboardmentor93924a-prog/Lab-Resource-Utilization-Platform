package com.labresource.backend.heatmap.service;

import com.labresource.backend.auth.entity.AppUser;
import com.labresource.backend.auth.repository.AppUserRepository;
import com.labresource.backend.booking.entity.Booking;
import com.labresource.backend.booking.repository.BookingRepository;
import com.labresource.backend.department.entity.Department;
import com.labresource.backend.department.repository.DepartmentRepository;
import com.labresource.backend.equipment.entity.Equipment;
import com.labresource.backend.equipment.repository.EquipmentOperatingScheduleRepository;
import com.labresource.backend.equipment.repository.EquipmentRepository;
import com.labresource.backend.heatmap.dto.HeatmapBookingDto;
import com.labresource.backend.heatmap.dto.HeatmapCellDto;
import com.labresource.backend.heatmap.dto.HeatmapDataDto;
import com.labresource.backend.heatmap.dto.HeatmapEquipmentDto;
import com.labresource.backend.heatmap.dto.HeatmapSummaryDto;
import com.labresource.backend.role.entity.Role;
import com.labresource.backend.security.UserPrincipal;
import com.labresource.backend.utilization.entity.UtilizationLog;
import com.labresource.backend.utilization.repository.UtilizationLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HeatmapService {

    private final EquipmentRepository equipmentRepository;
    private final DepartmentRepository departmentRepository;
    private final BookingRepository bookingRepository;
    private final AppUserRepository appUserRepository;
    private final UtilizationLogRepository utilizationLogRepository;
    private final EquipmentOperatingScheduleRepository scheduleRepository;

    public HeatmapDataDto getHeatmapData(
            UserPrincipal principal,
            Long filterDepartmentId,
            String viewBy,
            String dayValue,
            String weekValue,
            String monthValue,
            Integer year,
            LocalDateTime from,
            LocalDateTime to) {
        return getHeatmapDataInternal(principal, filterDepartmentId, viewBy, dayValue, weekValue, monthValue, year, from, to);
    }

    public HeatmapDataDto getHeatmapData(
            UserPrincipal principal,
            Long filterDepartmentId,
            LocalDateTime from,
            LocalDateTime to) {
        return getHeatmapDataInternal(principal, filterDepartmentId, null, null, null, null, null, from, to);
    }

    private HeatmapDataDto getHeatmapDataInternal(
            UserPrincipal principal,
            Long filterDepartmentId,
            String viewBy,
            String dayValue,
            String weekValue,
            String monthValue,
            Integer year,
            LocalDateTime from,
            LocalDateTime to) {

        // ── 1. Resolve scoped equipment list ─────────────────────────────
        List<Equipment> equipmentList = resolveEquipment(principal, filterDepartmentId);

        if (equipmentList.isEmpty()) {
            return new HeatmapDataDto(Collections.emptyList(), Collections.emptyList(), Collections.emptyList(), new HeatmapSummaryDto(0, 0.0, 0.0, 0));
        }

        // ── 2. Build departmentId → departmentName lookup ─────────────────
        List<Long> deptIds = equipmentList.stream()
                .map(Equipment::getDepartmentId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        Map<Long, String> deptNames = deptIds.isEmpty() ? Collections.emptyMap() :
                departmentRepository.findAllById(deptIds).stream()
                        .collect(Collectors.toMap(Department::getDepartmentId, Department::getName, (a, b) -> a));

        // ── 3. Map equipment to frontend DTO ──────────────────────────────
        List<HeatmapEquipmentDto> equipmentDtos = equipmentList.stream()
                .map(e -> new HeatmapEquipmentDto(
                        e.getEquipmentId(),
                        e.getName(),
                        e.getStatus(),
                        deptNames.getOrDefault(e.getDepartmentId(), "Unknown"),
                        e.getCategory() != null ? e.getCategory() : "Uncategorized"
                ))
                .toList();

        // ── 4. Fetch bookings for these equipment IDs ─────────────────────
        List<Long> equipmentIds = equipmentList.stream()
                .map(Equipment::getEquipmentId)
                .toList();

        LocalDateTime queryFrom = from != null ? from : LocalDateTime.of(2000, 1, 1, 0, 0);
        LocalDateTime queryTo = to != null ? to : LocalDateTime.of(2099, 12, 31, 23, 59, 59);
        List<Booking> bookings = bookingRepository.findByEquipmentIdInAndOverlapping(equipmentIds, queryFrom, queryTo);

        // Keep only usable statuses: CONFIRMED, IN_USE, and COMPLETED
        List<Booking> usableBookings = bookings.stream()
                .filter(b -> Booking.CONFIRMED.equals(b.getStatus())
                        || Booking.IN_USE.equals(b.getStatus())
                        || Booking.COMPLETED.equals(b.getStatus()))
                .toList();

        // ── 5. Fetch UtilizationLogs for COMPLETED bookings ──────────────
        List<Long> usableBookingIds = usableBookings.stream()
                .map(Booking::getBookingId)
                .filter(Objects::nonNull)
                .toList();

        Map<Long, UtilizationLog> logMap = usableBookingIds.isEmpty() ? Collections.emptyMap() :
                utilizationLogRepository.findByBookingIdIn(usableBookingIds).stream()
                        .collect(Collectors.toMap(UtilizationLog::getBookingId, l -> l, (a, b) -> a));

        // ── 6. Build userId → researcher name lookup ──────────────────────
        List<Long> userIds = usableBookings.stream()
                .map(Booking::getUserId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        Map<Long, String> userNames = userIds.isEmpty() ? Collections.emptyMap() :
                appUserRepository.findAllById(userIds).stream()
                        .collect(Collectors.toMap(
                                AppUser::getUserId,
                                u -> (u.getFirstName() + " " + (u.getLastName() != null ? u.getLastName() : "")).trim(),
                                (a, b) -> a
                        ));

        // ── 7. Map bookings & prepare EffectiveBookings ───────────────────
        List<HeatmapBookingDto> bookingDtos = new ArrayList<>();
        Map<Long, List<EffectiveBooking>> effectiveBookingsByEq = new HashMap<>();

        for (Booking b : usableBookings) {
            LocalDateTime effStart = b.getStartTime();
            LocalDateTime effEnd = b.getEndTime();

            if (Booking.COMPLETED.equals(b.getStatus()) && logMap.containsKey(b.getBookingId())) {
                UtilizationLog log = logMap.get(b.getBookingId());
                if (log.getUsageStartTime() != null) effStart = log.getUsageStartTime();
                if (log.getUsageEndTime() != null) effEnd = log.getUsageEndTime();
            }

            bookingDtos.add(new HeatmapBookingDto(
                    b.getBookingId(),
                    b.getEquipmentId(),
                    effStart.toString(),
                    effEnd.toString(),
                    b.getStatus(),
                    userNames.getOrDefault(b.getUserId(), "Unknown User"),
                    b.getPurpose() != null ? b.getPurpose() : ""
            ));

            effectiveBookingsByEq.computeIfAbsent(b.getEquipmentId(), k -> new ArrayList<>())
                    .add(new EffectiveBooking(b, effStart, effEnd));
        }

        // ── 8. Calculate cells & summary authoritatively ─────────────────
        List<ColumnBucket> buckets = buildColumnBuckets(viewBy, from, to);
        List<HeatmapCellDto> cells = new ArrayList<>();

        for (Equipment eq : equipmentList) {
            List<EffectiveBooking> eqBookings = effectiveBookingsByEq.getOrDefault(eq.getEquipmentId(), Collections.emptyList());
            for (ColumnBucket bucket : buckets) {
                double usedHours = 0.0;
                List<Long> matchedBookingIds = new ArrayList<>();
                for (EffectiveBooking eb : eqBookings) {
                    double overlap = calculateOverlapHours(bucket.start, bucket.end, eb.start, eb.end);
                    if (overlap > 0) {
                        usedHours += overlap;
                        matchedBookingIds.add(eb.booking.getBookingId());
                    }
                }
                int utilPct = 0;
                if (bucket.availableHours > 0) {
                    utilPct = (int) Math.round((usedHours / bucket.availableHours) * 100.0);
                }
                cells.add(new HeatmapCellDto(
                        eq.getEquipmentId(),
                        bucket.colKey,
                        Math.round(bucket.availableHours * 100.0) / 100.0,
                        Math.round(usedHours * 100.0) / 100.0,
                        utilPct,
                        matchedBookingIds
                ));
            }
        }

        double totalAvailableHours = cells.stream().mapToDouble(HeatmapCellDto::getAvailableHours).sum();
        double totalUsedHours = cells.stream().mapToDouble(HeatmapCellDto::getUsedHours).sum();
        int avgUtil = 0;
        if (totalAvailableHours > 0) {
            avgUtil = (int) Math.round((totalUsedHours / totalAvailableHours) * 100.0);
        } else if (!cells.isEmpty()) {
            avgUtil = (int) Math.round(cells.stream().mapToInt(HeatmapCellDto::getUtilizationPercentage).average().orElse(0.0));
        }

        int idleCount = 0;
        for (Equipment eq : equipmentList) {
            List<EffectiveBooking> eqBookings = effectiveBookingsByEq.getOrDefault(eq.getEquipmentId(), Collections.emptyList());
            if (eqBookings.isEmpty()) {
                idleCount++;
            }
        }

        HeatmapSummaryDto summary = new HeatmapSummaryDto(
                avgUtil,
                Math.round(totalAvailableHours * 100.0) / 100.0,
                Math.round(totalUsedHours * 100.0) / 100.0,
                idleCount
        );

        return new HeatmapDataDto(equipmentDtos, bookingDtos, cells, summary);
    }

    private List<Equipment> resolveEquipment(UserPrincipal principal, Long filterDepartmentId) {
        List<String> roles = principal.getRoleNames();
        Long userDeptId   = principal.getDepartmentId();
        Long userInstId   = principal.getInstitutionId();

        boolean isSysAdmin = roles.contains(Role.SYSTEM_ADMIN) || roles.contains("ROLE_" + Role.SYSTEM_ADMIN);
        boolean isInstAdmin = roles.contains(Role.INSTITUTION_ADMIN) || roles.contains("ROLE_" + Role.INSTITUTION_ADMIN);
        boolean isDeptScoped = roles.contains(Role.DEPARTMENT_HEAD) || roles.contains("ROLE_" + Role.DEPARTMENT_HEAD)
                || roles.contains(Role.LAB_MANAGER) || roles.contains("ROLE_" + Role.LAB_MANAGER)
                || roles.contains(Role.LAB_TECHNICIAN) || roles.contains("ROLE_" + Role.LAB_TECHNICIAN);

        if (isSysAdmin) {
            if (filterDepartmentId != null) {
                return equipmentRepository.findByDepartmentId(filterDepartmentId);
            }
            return equipmentRepository.findAll();

        } else if (isInstAdmin) {
            if (userInstId == null) {
                return Collections.emptyList();
            }
            List<Equipment> instEq = equipmentRepository.findByInstitutionId(userInstId);
            if (filterDepartmentId != null) {
                return instEq.stream()
                        .filter(e -> filterDepartmentId.equals(e.getDepartmentId()))
                        .toList();
            }
            return instEq;

        } else if (isDeptScoped) {
            if (userDeptId == null || userInstId == null) {
                return Collections.emptyList();
            }
            return equipmentRepository.findByDepartmentIdAndInstitutionId(userDeptId, userInstId);
        }

        return Collections.emptyList();
    }

    private List<ColumnBucket> buildColumnBuckets(String viewBy, LocalDateTime from, LocalDateTime to) {
        if (from == null || to == null) {
            return Collections.emptyList();
        }

        String view = viewBy != null ? viewBy.toLowerCase() : "";
        if (view.isEmpty()) {
            if (from.toLocalDate().equals(to.toLocalDate())) {
                view = "day";
            } else if (Duration.between(from, to).toDays() <= 7) {
                view = "week";
            } else if (Duration.between(from, to).toDays() <= 31) {
                view = "month";
            } else {
                view = "year";
            }
        }

        List<ColumnBucket> buckets = new ArrayList<>();

        switch (view) {
            case "day": {
                LocalDate baseDate = from.toLocalDate();
                for (int h = 8; h <= 17; h++) {
                    String colKey = baseDate.toString() + "-" + h;
                    LocalDateTime bStart = baseDate.atTime(h, 0);
                    LocalDateTime bEnd = baseDate.atTime(h + 1, 0);
                    buckets.add(new ColumnBucket(colKey, bStart, bEnd, 1.0));
                }
                break;
            }
            case "week":
            case "month": {
                LocalDate cur = from.toLocalDate();
                LocalDate endDate = to.toLocalDate();
                while (!cur.isAfter(endDate)) {
                    String colKey = cur.toString();
                    LocalDateTime bStart = cur.atStartOfDay();
                    LocalDateTime bEnd = cur.atTime(23, 59, 59, 999999999);
                    buckets.add(new ColumnBucket(colKey, bStart, bEnd, 8.0));
                    cur = cur.plusDays(1);
                }
                break;
            }
            case "year": {
                YearMonth cur = YearMonth.from(from);
                YearMonth endYM = YearMonth.from(to);
                while (!cur.isAfter(endYM)) {
                    String colKey = cur.toString();
                    LocalDateTime bStart = cur.atDay(1).atStartOfDay();
                    LocalDateTime bEnd = cur.atEndOfMonth().atTime(23, 59, 59, 999999999);
                    double avail = cur.lengthOfMonth() * 8.0;
                    buckets.add(new ColumnBucket(colKey, bStart, bEnd, avail));
                    cur = cur.plusMonths(1);
                }
                break;
            }
            default:
                break;
        }

        return buckets;
    }

    private double calculateOverlapHours(LocalDateTime bStart, LocalDateTime bEnd, LocalDateTime bkStart, LocalDateTime bkEnd) {
        if (bkEnd.isBefore(bStart) || bkStart.isAfter(bEnd)) {
            return 0.0;
        }
        LocalDateTime overlapStart = bkStart.isBefore(bStart) ? bStart : bkStart;
        LocalDateTime overlapEnd = bkEnd.isAfter(bEnd) ? bEnd : bkEnd;
        if (overlapStart.isAfter(overlapEnd)) {
            return 0.0;
        }
        long seconds = Duration.between(overlapStart, overlapEnd).getSeconds();
        return Math.max(0.0, seconds / 3600.0);
    }

    private static class ColumnBucket {
        final String colKey;
        final LocalDateTime start;
        final LocalDateTime end;
        final double availableHours;

        ColumnBucket(String colKey, LocalDateTime start, LocalDateTime end, double availableHours) {
            this.colKey = colKey;
            this.start = start;
            this.end = end;
            this.availableHours = availableHours;
        }
    }

    private static class EffectiveBooking {
        final Booking booking;
        final LocalDateTime start;
        final LocalDateTime end;

        EffectiveBooking(Booking booking, LocalDateTime start, LocalDateTime end) {
            this.booking = booking;
            this.start = start;
            this.end = end;
        }
    }
}
