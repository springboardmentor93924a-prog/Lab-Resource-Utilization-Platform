package com.example.lab_platform.service.impl;

import com.example.lab_platform.dto.CostRecordDTO;
import com.example.lab_platform.dto.CostSummaryDTO;
import com.example.lab_platform.dto.DepartmentCostDTO;
import com.example.lab_platform.dto.EquipmentCostDTO;
import com.example.lab_platform.dto.MonthlyCostDTO;
import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.Department;
import com.example.lab_platform.entity.DepartmentCostAllocation;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.EquipmentUsageCost;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.repository.DepartmentCostAllocationRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.EquipmentUsageCostRepository;
import com.example.lab_platform.service.CostManagementService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CostManagementServiceImpl implements CostManagementService {

    private static final DateTimeFormatter MONTH_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM");

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final EquipmentUsageCostRepository usageCostRepository;
    private final DepartmentCostAllocationRepository allocationRepository;

    public CostManagementServiceImpl(
            BookingRepository bookingRepository,
            EquipmentRepository equipmentRepository,
            EquipmentUsageCostRepository usageCostRepository,
            DepartmentCostAllocationRepository allocationRepository) {

        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.usageCostRepository = usageCostRepository;
        this.allocationRepository = allocationRepository;
    }

    // =========================================================
    // Institution scoping - same rule used across Task 1/2/6:
    // manager-tier roles only ever see their own institution's
    // data; SYSTEM_ADMIN sees the whole platform.
    // =========================================================
    private Integer scopedInstitutionIdOrNull() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !(authentication.getPrincipal() instanceof User)) {
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
                : -1; // no institution -> matches nothing
    }

    private boolean inScope(Equipment equipment, Integer scopedInstitutionId) {

        if (scopedInstitutionId == null) {
            return true;
        }

        return equipment.getInstitution() != null
                && scopedInstitutionId.equals(
                        equipment.getInstitution().getInstitutionId());
    }

    // =========================================================
    // Cost generation
    // =========================================================
    @Override
    public int generateMissingCostRecords() {

        List<Booking> bookings = bookingRepository.findByBookingStatus("Completed");

        int created = 0;

        for (Booking booking : bookings) {

            if (booking.getEquipment() == null
                    || booking.getStartTime() == null
                    || booking.getEndTime() == null) {
                continue;
            }

            if (!booking.getEndTime().isAfter(booking.getStartTime())) {
                continue;
            }

            if (usageCostRepository
                    .findByBooking_BookingId(booking.getBookingId())
                    .isPresent()) {
                continue;
            }

            Equipment equipment = booking.getEquipment();

            double usageHours = round(
                    Duration.between(
                            booking.getStartTime(),
                            booking.getEndTime()
                    ).toMinutes() / 60.0
            );

            double ratePerHour = equipment.getRatePerHour() != null
                    ? equipment.getRatePerHour()
                    : 0.0;

            double totalCost = round(usageHours * ratePerHour);

            EquipmentUsageCost usageCost = new EquipmentUsageCost();
            usageCost.setEquipment(equipment);
            usageCost.setBooking(booking);
            usageCost.setUser(booking.getUser());
            usageCost.setUsageStart(booking.getStartTime());
            usageCost.setUsageEnd(booking.getEndTime());
            usageCost.setUsageHours(usageHours);
            usageCost.setRatePerHour(ratePerHour);
            usageCost.setTotalCost(totalCost);
            usageCost.setCostStatus("PENDING");

            usageCost = usageCostRepository.save(usageCost);

            User bookingUser = booking.getUser();
            Department department = bookingUser != null
                    ? bookingUser.getDepartment()
                    : null;

            if (department != null) {
                DepartmentCostAllocation allocation = new DepartmentCostAllocation();
                allocation.setDepartment(department);
                allocation.setUsageCost(usageCost);
                allocation.setAllocationDate(java.time.LocalDate.now());
                allocation.setAllocatedAmount(totalCost);
                allocation.setAllocationStatus("PENDING");
                allocation.setRemarks(
                        "Auto-generated from booking #" + booking.getBookingId()
                                + " on " + equipment.getEquipmentName());

                allocationRepository.save(allocation);
            }

            created++;
        }

        return created;
    }

    // =========================================================
    // Reads
    // =========================================================
    @Override
    public List<CostRecordDTO> getAllUsageCosts() {

        generateMissingCostRecords();

        Integer scopedInstitutionId = scopedInstitutionIdOrNull();

        return usageCostRepository.findAll().stream()
                .filter(cost -> cost.getEquipment() != null
                        && inScope(cost.getEquipment(), scopedInstitutionId))
                .map(this::toDTO)
                .sorted(Comparator.comparing(
                        CostRecordDTO::getUsageEnd,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    @Override
    public CostSummaryDTO getCostSummary() {

        List<CostRecordDTO> records = getAllUsageCosts();

        CostSummaryDTO summary = new CostSummaryDTO();

        double totalCost = records.stream().mapToDouble(CostRecordDTO::getTotalCost).sum();

        double pendingCost = records.stream()
                .filter(r -> "PENDING".equalsIgnoreCase(r.getCostStatus()))
                .mapToDouble(CostRecordDTO::getTotalCost)
                .sum();

        double paidCost = records.stream()
                .filter(r -> "PAID".equalsIgnoreCase(r.getCostStatus()))
                .mapToDouble(CostRecordDTO::getTotalCost)
                .sum();

        double waivedCost = records.stream()
                .filter(r -> "WAIVED".equalsIgnoreCase(r.getCostStatus()))
                .mapToDouble(CostRecordDTO::getTotalCost)
                .sum();

        double totalHours = records.stream().mapToDouble(CostRecordDTO::getUsageHours).sum();

        summary.setTotalCost(round(totalCost));
        summary.setPendingCost(round(pendingCost));
        summary.setPaidCost(round(paidCost));
        summary.setWaivedCost(round(waivedCost));
        summary.setTotalBillableHours(round(totalHours));
        summary.setTotalUsageRecords(records.size());
        summary.setAverageCostPerBooking(
                records.isEmpty() ? 0.0 : round(totalCost / records.size()));

        List<EquipmentCostDTO> byEquipment = costByEquipment(records);
        summary.setCostByEquipment(byEquipment);

        summary.setMostExpensiveEquipment(
                byEquipment.stream()
                        .max(Comparator.comparingDouble(EquipmentCostDTO::getTotalCost))
                        .map(EquipmentCostDTO::getEquipmentName)
                        .orElse("N/A"));

        summary.setCostByDepartment(costByDepartment());
        summary.setCostByMonth(costByMonth(records));

        return summary;
    }

    public List<EquipmentCostDTO> costByEquipment(List<CostRecordDTO> records) {

        Map<Integer, EquipmentCostDTO> map = new HashMap<>();

        for (CostRecordDTO record : records) {

            if (record.getEquipmentId() == null) {
                continue;
            }

            EquipmentCostDTO dto = map.computeIfAbsent(
                    record.getEquipmentId(),
                    id -> {
                        EquipmentCostDTO d = new EquipmentCostDTO();
                        d.setEquipmentId(record.getEquipmentId());
                        d.setEquipmentName(record.getEquipmentName());
                        d.setRatePerHour(record.getRatePerHour());
                        return d;
                    });

            dto.setTotalCost(round(dto.getTotalCost() + record.getTotalCost()));
            dto.setTotalHours(round(dto.getTotalHours() + record.getUsageHours()));
            dto.setUsageCount(dto.getUsageCount() + 1);
        }

        return map.values().stream()
                .sorted(Comparator.comparingDouble(EquipmentCostDTO::getTotalCost).reversed())
                .collect(Collectors.toList());
    }

    public List<DepartmentCostDTO> costByDepartment() {

        Integer scopedInstitutionId = scopedInstitutionIdOrNull();

        Map<Integer, DepartmentCostDTO> map = new HashMap<>();

        for (DepartmentCostAllocation allocation : allocationRepository.findAll()) {

            EquipmentUsageCost usageCost = allocation.getUsageCost();

            if (usageCost == null || usageCost.getEquipment() == null) {
                continue;
            }

            if (!inScope(usageCost.getEquipment(), scopedInstitutionId)) {
                continue;
            }

            Department department = allocation.getDepartment();

            if (department == null) {
                continue;
            }

            DepartmentCostDTO dto = map.computeIfAbsent(
                    department.getDepartmentId(),
                    id -> {
                        DepartmentCostDTO d = new DepartmentCostDTO();
                        d.setDepartmentId(department.getDepartmentId());
                        d.setDepartmentName(department.getDepartmentName());
                        return d;
                    });

            double amount = allocation.getAllocatedAmount() != null
                    ? allocation.getAllocatedAmount()
                    : 0.0;

            dto.setTotalAllocatedCost(round(dto.getTotalAllocatedCost() + amount));
            dto.setAllocationCount(dto.getAllocationCount() + 1);

            String status = allocation.getAllocationStatus();

            if ("PAID".equalsIgnoreCase(status)) {
                dto.setPaidAmount(round(dto.getPaidAmount() + amount));
            } else {
                dto.setPendingAmount(round(dto.getPendingAmount() + amount));
            }
        }

        return map.values().stream()
                .sorted(Comparator.comparingDouble(DepartmentCostDTO::getTotalAllocatedCost).reversed())
                .collect(Collectors.toList());
    }

    private List<MonthlyCostDTO> costByMonth(List<CostRecordDTO> records) {

        Map<String, double[]> map = new HashMap<>(); // month -> [totalCost, count]

        for (CostRecordDTO record : records) {

            if (record.getUsageEnd() == null) {
                continue;
            }

            String month = record.getUsageEnd().format(MONTH_FORMAT);

            double[] bucket = map.computeIfAbsent(month, m -> new double[2]);
            bucket[0] += record.getTotalCost();
            bucket[1] += 1;
        }

        return map.entrySet().stream()
                .map(e -> new MonthlyCostDTO(
                        e.getKey(),
                        round(e.getValue()[0]),
                        (long) e.getValue()[1]))
                .sorted(Comparator.comparing(MonthlyCostDTO::getMonth))
                .collect(Collectors.toList());
    }

    // =========================================================
    // Writes
    // =========================================================
    @Override
    public CostRecordDTO updateCostStatus(Integer usageCostId, String newStatus) {

        if (newStatus == null
                || !List.of("PENDING", "PAID", "WAIVED").contains(newStatus.toUpperCase())) {
            throw new RuntimeException(
                    "Invalid cost status. Must be one of PENDING, PAID, WAIVED.");
        }

        EquipmentUsageCost usageCost = usageCostRepository.findById(usageCostId)
                .orElseThrow(() -> new RuntimeException("Usage cost record not found."));

        usageCost.setCostStatus(newStatus.toUpperCase());
        usageCost = usageCostRepository.save(usageCost);

        allocationRepository.findByUsageCost_UsageCostId(usageCostId)
                .ifPresent(allocation -> {
                    allocation.setAllocationStatus(newStatus.toUpperCase());
                    allocationRepository.save(allocation);
                });

        return toDTO(usageCost);
    }

    @Override
    public Equipment updateEquipmentRate(Integer equipmentId, Double ratePerHour) {

        if (ratePerHour == null || ratePerHour < 0) {
            throw new RuntimeException("Rate per hour must be a non-negative number.");
        }

        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new RuntimeException("Equipment not found."));

        equipment.setRatePerHour(ratePerHour);

        return equipmentRepository.save(equipment);
    }

    // =========================================================
    // Helpers
    // =========================================================
    private CostRecordDTO toDTO(EquipmentUsageCost usageCost) {

        CostRecordDTO dto = new CostRecordDTO();

        dto.setUsageCostId(usageCost.getUsageCostId());

        if (usageCost.getEquipment() != null) {
            dto.setEquipmentId(usageCost.getEquipment().getEquipmentId());
            dto.setEquipmentName(usageCost.getEquipment().getEquipmentName());
        }

        if (usageCost.getBooking() != null) {
            dto.setBookingId(usageCost.getBooking().getBookingId());
        }

        if (usageCost.getUser() != null) {
            dto.setUserId(usageCost.getUser().getUserId());
            dto.setUserName(usageCost.getUser().getFullName());

            if (usageCost.getUser().getDepartment() != null) {
                dto.setDepartmentName(
                        usageCost.getUser().getDepartment().getDepartmentName());
            }
        }

        dto.setUsageStart(usageCost.getUsageStart());
        dto.setUsageEnd(usageCost.getUsageEnd());
        dto.setUsageHours(usageCost.getUsageHours() != null ? usageCost.getUsageHours() : 0.0);
        dto.setRatePerHour(usageCost.getRatePerHour() != null ? usageCost.getRatePerHour() : 0.0);
        dto.setTotalCost(usageCost.getTotalCost() != null ? usageCost.getTotalCost() : 0.0);
        dto.setCostStatus(usageCost.getCostStatus());

        return dto;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
