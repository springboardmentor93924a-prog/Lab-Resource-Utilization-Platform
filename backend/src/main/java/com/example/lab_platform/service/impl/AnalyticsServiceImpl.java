package com.example.lab_platform.service.impl;

import com.example.lab_platform.dto.AnalyticsDashboardDTO;
import com.example.lab_platform.dto.BookingTrendDTO;
import com.example.lab_platform.dto.CostSummaryDTO;
import com.example.lab_platform.dto.UtilizationDTO;
import com.example.lab_platform.dto.UtilizationSummaryDTO;
import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.service.AnalyticsService;
import com.example.lab_platform.service.CostManagementService;
import com.example.lab_platform.service.UtilizationService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private static final DateTimeFormatter MONTH_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM");

    private final UtilizationService utilizationService;
    private final CostManagementService costManagementService;
    private final BookingRepository bookingRepository;

    public AnalyticsServiceImpl(
            UtilizationService utilizationService,
            CostManagementService costManagementService,
            BookingRepository bookingRepository) {

        this.utilizationService = utilizationService;
        this.costManagementService = costManagementService;
        this.bookingRepository = bookingRepository;
    }

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
                : -1;
    }

    @Override
    public AnalyticsDashboardDTO getDashboardAnalytics() {

        AnalyticsDashboardDTO dashboard = new AnalyticsDashboardDTO();

        // ---------------- Utilization (Task 1 & 2) ----------------
        List<UtilizationDTO> utilizationData = utilizationService.getUtilizationData();
        UtilizationSummaryDTO utilizationSummary = utilizationService.getUtilizationSummary();

        dashboard.setTotalEquipment(utilizationSummary.getTotalEquipment());
        dashboard.setAverageUtilization(utilizationSummary.getAverageUtilization());
        dashboard.setMostRequestedEquipment(utilizationSummary.getMostRequestedEquipment());
        dashboard.setHighestUtilizationEquipment(utilizationSummary.getHighestUtilizationEquipment());
        dashboard.setLowestUtilizationEquipment(utilizationSummary.getLowestUtilizationEquipment());

        dashboard.setTopUtilizedEquipment(
                utilizationData.stream()
                        .sorted(Comparator.comparingDouble(
                                UtilizationDTO::getUtilizationPercentage).reversed())
                        .limit(5)
                        .collect(Collectors.toList()));

        // ---------------- Cost (Task 3) ----------------
        CostSummaryDTO costSummary = costManagementService.getCostSummary();

        dashboard.setTotalCost(costSummary.getTotalCost());
        dashboard.setPendingCost(costSummary.getPendingCost());
        dashboard.setPaidCost(costSummary.getPaidCost());
        dashboard.setMostExpensiveEquipment(costSummary.getMostExpensiveEquipment());

        dashboard.setTopEquipmentByCost(
                costSummary.getCostByEquipment() == null
                        ? List.of()
                        : costSummary.getCostByEquipment().stream()
                                .limit(5)
                                .collect(Collectors.toList()));

        dashboard.setCostByDepartment(costSummary.getCostByDepartment());
        dashboard.setMonthlyCostTrend(costSummary.getCostByMonth());

        // ---------------- Bookings ----------------
        Integer scopedInstitutionId = scopedInstitutionIdOrNull();

        List<Booking> scopedBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getEquipment() != null && inScope(b.getEquipment(), scopedInstitutionId))
                .collect(Collectors.toList());

        dashboard.setTotalBookings(scopedBookings.size());

        Map<String, Long> statusBreakdown = scopedBookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getBookingStatus() != null ? b.getBookingStatus() : "UNKNOWN",
                        LinkedHashMap::new,
                        Collectors.counting()));

        dashboard.setBookingStatusBreakdown(statusBreakdown);

        dashboard.setMonthlyBookingTrend(monthlyBookingTrend(scopedBookings));

        return dashboard;
    }

    private boolean inScope(Equipment equipment, Integer scopedInstitutionId) {

        if (scopedInstitutionId == null) {
            return true;
        }

        return equipment.getInstitution() != null
                && scopedInstitutionId.equals(equipment.getInstitution().getInstitutionId());
    }

    private List<BookingTrendDTO> monthlyBookingTrend(List<Booking> bookings) {

        Map<String, long[]> map = new LinkedHashMap<>(); // month -> [total, completed]

        for (Booking booking : bookings) {

            if (booking.getBookingDate() == null) {
                continue;
            }

            String month = booking.getBookingDate().format(MONTH_FORMAT);

            long[] bucket = map.computeIfAbsent(month, m -> new long[2]);
            bucket[0] += 1;

            if (booking.getBookingStatus() != null
                    && booking.getBookingStatus().equalsIgnoreCase("Completed")) {
                bucket[1] += 1;
            }
        }

        return map.entrySet().stream()
                .map(e -> new BookingTrendDTO(e.getKey(), e.getValue()[0], e.getValue()[1]))
                .sorted(Comparator.comparing(BookingTrendDTO::getMonth))
                .collect(Collectors.toList());
    }
}
