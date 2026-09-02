package com.example.lab_platform.service.impl;

import com.example.lab_platform.dto.*;
import com.example.lab_platform.entity.*;
import com.example.lab_platform.repository.*;
import com.example.lab_platform.service.ReportService;
import com.example.lab_platform.service.UtilizationService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    private static final List<String> VALID_BOOKING_STATUSES =
            List.of("completed", "confirmed", "approved");

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final WorkOrderRepository workOrderRepository;
    private final EquipmentDowntimeRepository downtimeRepository;
    private final MaintenanceServiceLogRepository serviceLogRepository;
    private final ResourceSharingRepository resourceSharingRepository;
    private final EquipmentUsageCostRepository usageCostRepository;
    private final UtilizationService utilizationService;

    public ReportServiceImpl(
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            MaintenanceRepository maintenanceRepository,
            WorkOrderRepository workOrderRepository,
            EquipmentDowntimeRepository downtimeRepository,
            MaintenanceServiceLogRepository serviceLogRepository,
            ResourceSharingRepository resourceSharingRepository,
            EquipmentUsageCostRepository usageCostRepository,
            UtilizationService utilizationService) {

        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.workOrderRepository = workOrderRepository;
        this.downtimeRepository = downtimeRepository;
        this.serviceLogRepository = serviceLogRepository;
        this.resourceSharingRepository = resourceSharingRepository;
        this.usageCostRepository = usageCostRepository;
        this.utilizationService = utilizationService;
    }

    // =========================================================
    // Institution scoping - same convention already used by
    // UtilizationServiceImpl / CostManagementServiceImpl / AnalyticsServiceImpl.
    // =========================================================
    private Integer scopedInstitutionIdOrNull() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return null;
        }

        User loggedInUser = (User) authentication.getPrincipal();
        String role = loggedInUser.getRole() != null
                ? loggedInUser.getRole().getRoleName()
                : null;

        if ("SYSTEM_ADMIN".equalsIgnoreCase(role)) {
            return null;
        }

        return loggedInUser.getInstitution() != null
                ? loggedInUser.getInstitution().getInstitutionId()
                : -1;
    }

    private List<Equipment> scopedFilteredEquipment(
            Integer departmentId, Integer institutionId,
            Integer equipmentId, String category) {

        Integer autoScopedInstitutionId = scopedInstitutionIdOrNull();

        return equipmentRepository.findAll().stream()
                .filter(e -> autoScopedInstitutionId == null
                        || (e.getInstitution() != null
                                && autoScopedInstitutionId.equals(e.getInstitution().getInstitutionId())))
                .filter(e -> institutionId == null
                        || (e.getInstitution() != null
                                && institutionId.equals(e.getInstitution().getInstitutionId())))
                .filter(e -> departmentId == null
                        || (e.getDepartment() != null
                                && departmentId.equals(e.getDepartment().getDepartmentId())))
                .filter(e -> equipmentId == null || equipmentId.equals(e.getEquipmentId()))
                .filter(e -> category == null || category.isBlank()
                        || category.equalsIgnoreCase(e.getCategory()))
                .collect(Collectors.toList());
    }

    // Normalizes/validates a date range. Returns [effectiveStart, effectiveEnd]
    // as LocalDateTime, defaulting to "all time" when not supplied, and
    // silently swapping a reversed range instead of throwing on a mild
    // user mistake - the report is still meaningful either way.
    private LocalDateTime[] normalizeRange(LocalDate startDate, LocalDate endDate) {

        LocalDateTime rangeStart = startDate != null
                ? startDate.atStartOfDay()
                : LocalDateTime.of(2000, 1, 1, 0, 0);

        LocalDateTime rangeEnd = endDate != null
                ? endDate.plusDays(1).atStartOfDay()
                : LocalDateTime.now().plusDays(1);

        if (rangeEnd.isBefore(rangeStart)) {
            LocalDateTime tmp = rangeStart;
            rangeStart = rangeEnd;
            rangeEnd = tmp;
        }

        return new LocalDateTime[] { rangeStart, rangeEnd };
    }

    private Map<String, String> filterMap(Object... kv) {
        Map<String, String> map = new LinkedHashMap<>();
        for (int i = 0; i < kv.length; i += 2) {
            Object value = kv[i + 1];
            map.put(String.valueOf(kv[i]), value == null ? "any" : String.valueOf(value));
        }
        return map;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    // =========================================================
    // REPORT A - Equipment Utilization
    // =========================================================
    @Override
    public EquipmentUtilizationReportDTO getEquipmentUtilizationReport(
            LocalDate startDate, LocalDate endDate,
            Integer departmentId, Integer institutionId,
            Integer equipmentId, String category) {

        List<Equipment> equipment =
                scopedFilteredEquipment(departmentId, institutionId, equipmentId, category);

        List<Booking> bookings = bookingRepository.findAll();

        LocalDateTime[] range = normalizeRange(startDate, endDate);
        LocalDateTime rangeStart = range[0];
        LocalDateTime rangeEnd = range[1];

        double totalPeriodHours =
                Duration.between(rangeStart, rangeEnd).toMinutes() / 60.0;

        List<EquipmentUtilizationRowDTO> rows = new ArrayList<>();

        for (Equipment eq : equipment) {

            double usedHours = 0.0;
            long bookingCount = 0;

            for (Booking booking : bookings) {

                if (booking.getEquipment() == null
                        || !booking.getEquipment().getEquipmentId().equals(eq.getEquipmentId())) {
                    continue;
                }

                if (booking.getStartTime() == null || booking.getEndTime() == null) {
                    continue;
                }

                String status = booking.getBookingStatus();
                if (status == null || !VALID_BOOKING_STATUSES.contains(status.trim().toLowerCase())) {
                    continue;
                }

                LocalDateTime bookingStart = booking.getStartTime();
                LocalDateTime bookingEnd = booking.getEndTime();

                if (!bookingEnd.isAfter(rangeStart) || !bookingStart.isBefore(rangeEnd)) {
                    continue;
                }

                LocalDateTime effectiveStart = bookingStart.isBefore(rangeStart) ? rangeStart : bookingStart;
                LocalDateTime effectiveEnd = bookingEnd.isAfter(rangeEnd) ? rangeEnd : bookingEnd;

                if (!effectiveEnd.isAfter(effectiveStart)) {
                    continue;
                }

                usedHours += Duration.between(effectiveStart, effectiveEnd).toMinutes() / 60.0;
                bookingCount++;
            }

            if (usedHours > totalPeriodHours) {
                usedHours = totalPeriodHours;
            }

            double idleHours = Math.max(0.0, totalPeriodHours - usedHours);
            double utilizationPercentage =
                    totalPeriodHours > 0 ? (usedHours / totalPeriodHours) * 100.0 : 0.0;

            EquipmentUtilizationRowDTO row = new EquipmentUtilizationRowDTO();
            row.setEquipmentId(eq.getEquipmentId());
            row.setEquipmentName(eq.getEquipmentName());
            row.setCategory(eq.getCategory());
            row.setDepartmentName(eq.getDepartment() != null ? eq.getDepartment().getDepartmentName() : "Unassigned");
            row.setInstitutionName(eq.getInstitution() != null ? eq.getInstitution().getInstitutionName() : "Unassigned");
            row.setTotalAvailableHours(round(totalPeriodHours));
            row.setTotalBookedHours(round(usedHours));
            row.setIdleHours(round(idleHours));
            row.setUtilizationPercentage(round(utilizationPercentage));
            row.setBookingCount(bookingCount);
            row.setCurrentStatus(eq.getStatus());

            rows.add(row);
        }

        rows.sort(Comparator.comparingDouble(EquipmentUtilizationRowDTO::getUtilizationPercentage).reversed());

        EquipmentUtilizationReportDTO report = new EquipmentUtilizationReportDTO();
        report.setGeneratedAt(LocalDateTime.now());
        report.setAppliedFilters(filterMap(
                "startDate", startDate, "endDate", endDate,
                "departmentId", departmentId, "institutionId", institutionId,
                "equipmentId", equipmentId, "category", category));
        report.setTotalEquipment(rows.size());
        report.setTotalBookedHours(round(rows.stream().mapToDouble(EquipmentUtilizationRowDTO::getTotalBookedHours).sum()));
        report.setTotalAvailableHours(round(rows.stream().mapToDouble(EquipmentUtilizationRowDTO::getTotalAvailableHours).sum()));
        report.setAverageUtilization(rows.isEmpty() ? 0.0 : round(
                rows.stream().mapToDouble(EquipmentUtilizationRowDTO::getUtilizationPercentage).average().orElse(0.0)));
        report.setHighestUtilizationEquipment(rows.stream()
                .max(Comparator.comparingDouble(EquipmentUtilizationRowDTO::getUtilizationPercentage))
                .map(EquipmentUtilizationRowDTO::getEquipmentName).orElse("N/A"));
        report.setLowestUtilizationEquipment(rows.stream()
                .min(Comparator.comparingDouble(EquipmentUtilizationRowDTO::getUtilizationPercentage))
                .map(EquipmentUtilizationRowDTO::getEquipmentName).orElse("N/A"));
        report.setRows(rows);

        return report;
    }

    // =========================================================
    // REPORT B - Department / Resource Usage
    // =========================================================
    @Override
    public DepartmentUsageReportDTO getDepartmentUsageReport(
            LocalDate startDate, LocalDate endDate,
            Integer departmentId, Integer institutionId) {

        EquipmentUtilizationReportDTO equipmentReport =
                getEquipmentUtilizationReport(startDate, endDate, departmentId, institutionId, null, null);

        Map<String, List<EquipmentUtilizationRowDTO>> byDepartment = equipmentReport.getRows().stream()
                .collect(Collectors.groupingBy(
                        EquipmentUtilizationRowDTO::getDepartmentName, LinkedHashMap::new, Collectors.toList()));

        List<DepartmentUsageRowDTO> rows = new ArrayList<>();

        for (Map.Entry<String, List<EquipmentUtilizationRowDTO>> entry : byDepartment.entrySet()) {

            List<EquipmentUtilizationRowDTO> deptRows = entry.getValue();

            double totalUsage = deptRows.stream().mapToDouble(EquipmentUtilizationRowDTO::getTotalBookedHours).sum();
            double totalAvailable = deptRows.stream().mapToDouble(EquipmentUtilizationRowDTO::getTotalAvailableHours).sum();
            long bookingCount = deptRows.stream().mapToLong(EquipmentUtilizationRowDTO::getBookingCount).sum();

            DepartmentUsageRowDTO row = new DepartmentUsageRowDTO();
            row.setDepartmentId(null); // multiple equipment share the name key; id omitted intentionally
            row.setDepartmentName(entry.getKey());
            row.setEquipmentCount(deptRows.size());
            row.setBookingCount(bookingCount);
            row.setTotalUsageHours(round(totalUsage));
            row.setTotalAvailableHours(round(totalAvailable));
            row.setUtilizationPercentage(totalAvailable > 0 ? round((totalUsage / totalAvailable) * 100.0) : 0.0);
            row.setMostUsedEquipment(deptRows.stream()
                    .max(Comparator.comparingDouble(EquipmentUtilizationRowDTO::getTotalBookedHours))
                    .map(EquipmentUtilizationRowDTO::getEquipmentName).orElse("N/A"));

            rows.add(row);
        }

        rows.sort(Comparator.comparingDouble(DepartmentUsageRowDTO::getUtilizationPercentage).reversed());

        DepartmentUsageReportDTO report = new DepartmentUsageReportDTO();
        report.setGeneratedAt(LocalDateTime.now());
        report.setAppliedFilters(filterMap(
                "startDate", startDate, "endDate", endDate,
                "departmentId", departmentId, "institutionId", institutionId));
        report.setTotalDepartments(rows.size());
        report.setTotalBookings(rows.stream().mapToLong(DepartmentUsageRowDTO::getBookingCount).sum());
        report.setTotalUsageHours(round(rows.stream().mapToDouble(DepartmentUsageRowDTO::getTotalUsageHours).sum()));
        report.setMostActiveDepartment(rows.stream()
                .max(Comparator.comparingDouble(DepartmentUsageRowDTO::getTotalUsageHours))
                .map(DepartmentUsageRowDTO::getDepartmentName).orElse("N/A"));
        report.setRows(rows);

        return report;
    }

    // =========================================================
    // REPORT C - Maintenance & Downtime
    // =========================================================
    @Override
    public MaintenanceDowntimeReportDTO getMaintenanceDowntimeReport(
            LocalDate startDate, LocalDate endDate,
            Integer departmentId, Integer institutionId, Integer equipmentId) {

        Set<Integer> scopedEquipmentIds = scopedFilteredEquipment(departmentId, institutionId, equipmentId, null)
                .stream().map(Equipment::getEquipmentId).collect(Collectors.toSet());

        LocalDateTime[] range = normalizeRange(startDate, endDate);
        LocalDateTime rangeStart = range[0];
        LocalDateTime rangeEnd = range[1];

        // Latest work order per equipment, for a best-effort work-order-status column.
        Map<Integer, WorkOrder> latestWorkOrderByEquipment = new HashMap<>();
        for (WorkOrder wo : workOrderRepository.findAll()) {
            if (wo.getEquipment() == null || !scopedEquipmentIds.contains(wo.getEquipment().getEquipmentId())) {
                continue;
            }
            Integer eqId = wo.getEquipment().getEquipmentId();
            WorkOrder existing = latestWorkOrderByEquipment.get(eqId);
            if (existing == null
                    || (wo.getWorkOrderDate() != null && existing.getWorkOrderDate() != null
                            && wo.getWorkOrderDate().isAfter(existing.getWorkOrderDate()))) {
                latestWorkOrderByEquipment.put(eqId, wo);
            }
        }

        List<EquipmentDowntime> allDowntime = downtimeRepository.findAll().stream()
                .filter(d -> d.getEquipment() != null && scopedEquipmentIds.contains(d.getEquipment().getEquipmentId()))
                .filter(d -> d.getStartDate() != null
                        && d.getStartDate().isBefore(rangeEnd)
                        && (d.getEndDate() == null || d.getEndDate().isAfter(rangeStart)))
                .collect(Collectors.toList());

        Set<Integer> matchedDowntimeIds = new HashSet<>();
        List<MaintenanceDowntimeRowDTO> rows = new ArrayList<>();

        List<Maintenance> maintenanceRecords = maintenanceRepository.findAll().stream()
                .filter(m -> m.getEquipment() != null && scopedEquipmentIds.contains(m.getEquipment().getEquipmentId()))
                .filter(m -> m.getMaintenanceDate() == null
                        || (!m.getMaintenanceDate().isBefore(rangeStart.toLocalDate())
                                && m.getMaintenanceDate().isBefore(rangeEnd.toLocalDate())))
                .collect(Collectors.toList());

        for (Maintenance m : maintenanceRecords) {

            List<EquipmentDowntime> linked = allDowntime.stream()
                    .filter(d -> d.getMaintenance() != null
                            && d.getMaintenance().getMaintenanceId().equals(m.getMaintenanceId()))
                    .collect(Collectors.toList());

            linked.forEach(d -> matchedDowntimeIds.add(d.getDowntimeId()));

            double downtimeHours = 0.0;
            LocalDateTime earliestStart = null;
            LocalDateTime latestEnd = null;
            String reason = null;

            for (EquipmentDowntime d : linked) {
                LocalDateTime effectiveStart = d.getStartDate().isBefore(rangeStart) ? rangeStart : d.getStartDate();
                LocalDateTime effectiveEnd = d.getEndDate() == null
                        ? (rangeEnd.isBefore(LocalDateTime.now()) ? rangeEnd : LocalDateTime.now())
                        : (d.getEndDate().isAfter(rangeEnd) ? rangeEnd : d.getEndDate());

                if (effectiveEnd.isAfter(effectiveStart)) {
                    downtimeHours += Duration.between(effectiveStart, effectiveEnd).toMinutes() / 60.0;
                }

                earliestStart = earliestStart == null || d.getStartDate().isBefore(earliestStart) ? d.getStartDate() : earliestStart;
                latestEnd = d.getEndDate() != null && (latestEnd == null || d.getEndDate().isAfter(latestEnd)) ? d.getEndDate() : latestEnd;
                reason = d.getReason();
            }

            MaintenanceDowntimeRowDTO row = new MaintenanceDowntimeRowDTO();
            row.setEquipmentId(m.getEquipment().getEquipmentId());
            row.setEquipmentName(m.getEquipment().getEquipmentName());
            row.setDepartmentName(m.getEquipment().getDepartment() != null
                    ? m.getEquipment().getDepartment().getDepartmentName() : "Unassigned");
            row.setMaintenanceType(m.getMaintenanceType());
            row.setMaintenanceDate(m.getMaintenanceDate());
            row.setMaintenanceStatus(m.getMaintenanceStatus());
            row.setAssignedTechnician(m.getAssignedTechnician() != null ? m.getAssignedTechnician().getFullName() : "Unassigned");

            WorkOrder wo = latestWorkOrderByEquipment.get(m.getEquipment().getEquipmentId());
            row.setWorkOrderStatus(wo != null ? wo.getWorkOrderStatus() : "N/A");

            row.setDowntimeStart(earliestStart);
            row.setDowntimeEnd(latestEnd);
            row.setDowntimeHours(round(downtimeHours));
            row.setDowntimeReason(reason);

            rows.add(row);
        }

        // Ad-hoc downtime not tied to any Maintenance record - still real
        // data, so it must still be reflected in the report.
        for (EquipmentDowntime d : allDowntime) {

            if (matchedDowntimeIds.contains(d.getDowntimeId())) {
                continue;
            }

            LocalDateTime effectiveStart = d.getStartDate().isBefore(rangeStart) ? rangeStart : d.getStartDate();
            LocalDateTime effectiveEnd = d.getEndDate() == null
                    ? (rangeEnd.isBefore(LocalDateTime.now()) ? rangeEnd : LocalDateTime.now())
                    : (d.getEndDate().isAfter(rangeEnd) ? rangeEnd : d.getEndDate());

            double hours = effectiveEnd.isAfter(effectiveStart)
                    ? Duration.between(effectiveStart, effectiveEnd).toMinutes() / 60.0 : 0.0;

            MaintenanceDowntimeRowDTO row = new MaintenanceDowntimeRowDTO();
            row.setEquipmentId(d.getEquipment().getEquipmentId());
            row.setEquipmentName(d.getEquipment().getEquipmentName());
            row.setDepartmentName(d.getEquipment().getDepartment() != null
                    ? d.getEquipment().getDepartment().getDepartmentName() : "Unassigned");
            row.setMaintenanceType("Unplanned downtime");
            row.setMaintenanceDate(d.getStartDate().toLocalDate());
            row.setMaintenanceStatus(d.getDowntimeStatus());
            row.setAssignedTechnician("N/A");

            WorkOrder wo = latestWorkOrderByEquipment.get(d.getEquipment().getEquipmentId());
            row.setWorkOrderStatus(wo != null ? wo.getWorkOrderStatus() : "N/A");

            row.setDowntimeStart(d.getStartDate());
            row.setDowntimeEnd(d.getEndDate());
            row.setDowntimeHours(round(hours));
            row.setDowntimeReason(d.getReason());

            rows.add(row);
        }

        rows.sort(Comparator.comparing(MaintenanceDowntimeRowDTO::getMaintenanceDate,
                Comparator.nullsLast(Comparator.reverseOrder())));

        MaintenanceDowntimeReportDTO report = new MaintenanceDowntimeReportDTO();
        report.setGeneratedAt(LocalDateTime.now());
        report.setAppliedFilters(filterMap(
                "startDate", startDate, "endDate", endDate,
                "departmentId", departmentId, "institutionId", institutionId, "equipmentId", equipmentId));
        report.setTotalMaintenanceEvents(maintenanceRecords.size());
        report.setTotalDowntimeEvents(rows.stream().mapToLong(r -> r.getDowntimeHours() > 0 || r.getDowntimeStart() != null ? 1 : 0).sum());
        report.setTotalDowntimeHours(round(rows.stream().mapToDouble(MaintenanceDowntimeRowDTO::getDowntimeHours).sum()));
        report.setAverageDowntimeHours(rows.isEmpty() ? 0.0 : round(
                rows.stream().mapToDouble(MaintenanceDowntimeRowDTO::getDowntimeHours).average().orElse(0.0)));

        Map<String, Double> downtimeByEquipment = rows.stream()
                .collect(Collectors.groupingBy(MaintenanceDowntimeRowDTO::getEquipmentName,
                        Collectors.summingDouble(MaintenanceDowntimeRowDTO::getDowntimeHours)));
        report.setEquipmentWithHighestDowntime(downtimeByEquipment.entrySet().stream()
                .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A"));

        report.setRows(rows);

        return report;
    }

    // =========================================================
    // REPORT D - Inter-Institution Sharing
    // =========================================================
    @Override
    public SharingReportDTO getInterInstitutionSharingReport(
            LocalDate startDate, LocalDate endDate,
            Integer institutionId, String status) {

        Integer autoScopedInstitutionId = scopedInstitutionIdOrNull();
        Integer effectiveInstitutionId = institutionId != null ? institutionId : autoScopedInstitutionId;

        LocalDateTime[] range = normalizeRange(startDate, endDate);
        LocalDateTime rangeStart = range[0];
        LocalDateTime rangeEnd = range[1];

        List<ResourceSharingRequest> requests;

        if (effectiveInstitutionId != null) {
            Set<ResourceSharingRequest> combined = new LinkedHashSet<>();
            combined.addAll(resourceSharingRepository.findBySenderInstitution_InstitutionId(effectiveInstitutionId));
            combined.addAll(resourceSharingRepository.findByReceiverInstitution_InstitutionId(effectiveInstitutionId));
            requests = new ArrayList<>(combined);
        } else {
            requests = resourceSharingRepository.findAll();
        }

        requests = requests.stream()
                .filter(r -> r.getRequestDate() == null
                        || (!r.getRequestDate().isBefore(rangeStart) && r.getRequestDate().isBefore(rangeEnd)))
                .filter(r -> status == null || status.isBlank() || status.equalsIgnoreCase(r.getStatus()))
                .collect(Collectors.toList());

        List<SharingReportRowDTO> rows = new ArrayList<>();

        for (ResourceSharingRequest r : requests) {
            SharingReportRowDTO row = new SharingReportRowDTO();
            row.setRequestId(r.getId());
            row.setEquipmentName(r.getEquipment() != null ? r.getEquipment().getEquipmentName() : "N/A");
            row.setRequestingInstitution(r.getSenderInstitution() != null ? r.getSenderInstitution().getInstitutionName() : "N/A");
            row.setProvidingInstitution(r.getReceiverInstitution() != null ? r.getReceiverInstitution().getInstitutionName() : "N/A");
            row.setRequestDate(r.getRequestDate());
            row.setStatus(r.getStatus());
            rows.add(row);
        }

        rows.sort(Comparator.comparing(SharingReportRowDTO::getRequestDate,
                Comparator.nullsLast(Comparator.reverseOrder())));

        SharingReportDTO report = new SharingReportDTO();
        report.setGeneratedAt(LocalDateTime.now());
        report.setAppliedFilters(filterMap(
                "startDate", startDate, "endDate", endDate,
                "institutionId", institutionId, "status", status));
        report.setTotalRequests(rows.size());
        report.setApprovedRequests(rows.stream().filter(r -> "APPROVED".equalsIgnoreCase(r.getStatus())).count());
        report.setRejectedRequests(rows.stream().filter(r -> "REJECTED".equalsIgnoreCase(r.getStatus())).count());
        report.setPendingRequests(rows.stream().filter(r -> "PENDING".equalsIgnoreCase(r.getStatus())).count());

        report.setMostSharedEquipment(rows.stream()
                .collect(Collectors.groupingBy(SharingReportRowDTO::getEquipmentName, Collectors.counting()))
                .entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A"));

        Map<String, Long> institutionActivity = new HashMap<>();
        for (SharingReportRowDTO row : rows) {
            institutionActivity.merge(row.getRequestingInstitution(), 1L, Long::sum);
            institutionActivity.merge(row.getProvidingInstitution(), 1L, Long::sum);
        }
        report.setMostActiveInstitution(institutionActivity.entrySet().stream()
                .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("N/A"));

        report.setRows(rows);

        return report;
    }

    // =========================================================
    // REPORT E - Procurement & Cost Analysis
    // =========================================================
    @Override
    public ProcurementCostReportDTO getProcurementCostReport(
            Integer departmentId, Integer institutionId,
            Integer equipmentId, String category) {

        List<Equipment> equipment =
                scopedFilteredEquipment(departmentId, institutionId, equipmentId, category);

        // Reuse Task 2's utilization figures (matched by equipment name,
        // the only common key UtilizationDTO exposes) purely as a
        // supplementary "cost vs utilization" data point - not
        // recomputed here.
        Map<String, Double> utilizationByName = utilizationService.getUtilizationData().stream()
                .collect(Collectors.toMap(UtilizationDTO::getEquipmentName,
                        UtilizationDTO::getUtilizationPercentage, (a, b) -> a));

        List<ProcurementCostRowDTO> rows = new ArrayList<>();
        long missingPurchaseCost = 0;

        for (Equipment eq : equipment) {

            double usageCost = usageCostRepository.findByEquipment_EquipmentId(eq.getEquipmentId()).stream()
                    .mapToDouble(u -> u.getTotalCost() != null ? u.getTotalCost() : 0.0)
                    .sum();

            double usageHours = usageCostRepository.findByEquipment_EquipmentId(eq.getEquipmentId()).stream()
                    .mapToDouble(u -> u.getUsageHours() != null ? u.getUsageHours() : 0.0)
                    .sum();

            double maintenanceCost = serviceLogRepository.findByWorkOrder_Equipment_EquipmentId(eq.getEquipmentId()).stream()
                    .mapToDouble(log -> log.getServiceCost() != null ? log.getServiceCost() : 0.0)
                    .sum();

            double totalOperationalCost = round(usageCost + maintenanceCost);

            if (eq.getPurchaseCost() == null) {
                missingPurchaseCost++;
            }

            ProcurementCostRowDTO row = new ProcurementCostRowDTO();
            row.setEquipmentId(eq.getEquipmentId());
            row.setEquipmentName(eq.getEquipmentName());
            row.setCategory(eq.getCategory());
            row.setDepartmentName(eq.getDepartment() != null ? eq.getDepartment().getDepartmentName() : "Unassigned");
            row.setInstitutionName(eq.getInstitution() != null ? eq.getInstitution().getInstitutionName() : "Unassigned");
            row.setPurchaseDate(eq.getPurchaseDate());
            row.setPurchaseCost(eq.getPurchaseCost());
            row.setUsageCost(round(usageCost));
            row.setMaintenanceCost(round(maintenanceCost));
            row.setTotalOperationalCost(totalOperationalCost);
            row.setUtilizationPercentage(utilizationByName.getOrDefault(eq.getEquipmentName(), 0.0));
            row.setCostPerUsageHour(usageHours > 0 ? round(totalOperationalCost / usageHours) : null);

            rows.add(row);
        }

        rows.sort(Comparator.comparingDouble(ProcurementCostRowDTO::getTotalOperationalCost).reversed());

        ProcurementCostReportDTO report = new ProcurementCostReportDTO();
        report.setGeneratedAt(LocalDateTime.now());
        report.setAppliedFilters(filterMap(
                "departmentId", departmentId, "institutionId", institutionId,
                "equipmentId", equipmentId, "category", category));
        report.setTotalPurchaseCost(round(rows.stream()
                .filter(r -> r.getPurchaseCost() != null)
                .mapToDouble(ProcurementCostRowDTO::getPurchaseCost).sum()));
        report.setTotalUsageCost(round(rows.stream().mapToDouble(ProcurementCostRowDTO::getUsageCost).sum()));
        report.setTotalMaintenanceCost(round(rows.stream().mapToDouble(ProcurementCostRowDTO::getMaintenanceCost).sum()));
        report.setTotalOperationalCost(round(rows.stream().mapToDouble(ProcurementCostRowDTO::getTotalOperationalCost).sum()));
        report.setHighestCostEquipment(rows.stream()
                .max(Comparator.comparingDouble(ProcurementCostRowDTO::getTotalOperationalCost))
                .map(ProcurementCostRowDTO::getEquipmentName).orElse("N/A"));
        report.setMostUsedEquipment(rows.stream()
                .max(Comparator.comparingDouble(ProcurementCostRowDTO::getUtilizationPercentage))
                .map(ProcurementCostRowDTO::getEquipmentName).orElse("N/A"));
        report.setEquipmentMissingPurchaseCost(missingPurchaseCost);
        report.setRows(rows);

        return report;
    }
}
