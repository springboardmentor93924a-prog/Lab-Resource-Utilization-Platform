package com.labresource.service;

import com.labresource.entity.Booking;
import com.labresource.entity.BookingStatus;
import com.labresource.repository.BookingRepository;
import org.springframework.stereotype.Service;

import com.labresource.dto.DemandAnalysisResponse;
import com.labresource.entity.Equipment;
import com.labresource.repository.EquipmentRepository;
import com.labresource.dto.DemandTrendResponse;
import com.labresource.dto.EquipmentRankingResponse;
import com.labresource.dto.UtilizationReportResponse;

import java.util.ArrayList;
import java.util.Comparator;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class UtilizationAnalyticsServiceImpl
        implements UtilizationAnalyticsService {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;

    public UtilizationAnalyticsServiceImpl(
            BookingRepository bookingRepository,
            EquipmentRepository equipmentRepository) {

        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
    }

    // =========================================================
    // 5.16.1 - EQUIPMENT UTILIZATION RATE
    // =========================================================

    @Override
    public double calculateEquipmentUtilization(
            Long equipmentId,
            LocalDate startDate,
            LocalDate endDate) {

        // Validate equipment ID
        if (equipmentId == null) {
            throw new RuntimeException(
                    "Equipment ID is required."
            );
        }

        // Validate dates
        if (startDate == null || endDate == null) {
            throw new RuntimeException(
                    "Start date and end date are required."
            );
        }

        if (endDate.isBefore(startDate)) {
            throw new RuntimeException(
                    "End date cannot be before start date."
            );
        }

        // Get all bookings for equipment
        List<Booking> bookings =
                bookingRepository.findByEquipmentId(
                        equipmentId
                );

        double bookedHours = 0;

        // =====================================================
        // CALCULATE TOTAL BOOKED HOURS
        // =====================================================

        for (Booking booking : bookings) {

            if (booking.getBookingDate() == null) {
                continue;
            }

            // Only selected date range
            if (booking.getBookingDate()
                    .isBefore(startDate)
                    ||
                booking.getBookingDate()
                    .isAfter(endDate)) {

                continue;
            }

            // Only approved/confirmed bookings
            if (!isValidBookingStatus(
                    booking.getStatus())) {

                continue;
            }

            LocalTime start =
                    booking.getStartTime();

            LocalTime end =
                    booking.getEndTime();

            if (start == null || end == null) {
                continue;
            }

            if (!end.isAfter(start)) {
                continue;
            }

            long minutes =
                    Duration.between(
                            start,
                            end
                    ).toMinutes();

            bookedHours += minutes / 60.0;
        }

        // =====================================================
        // CALCULATE AVAILABLE HOURS
        // =====================================================

        long numberOfDays =
                Duration.between(
                        startDate.atStartOfDay(),
                        endDate.plusDays(1)
                                .atStartOfDay()
                ).toDays();

        /*
         * Laboratory equipment is considered available
         * for 8 hours per day.
         */
        double availableHours =
                numberOfDays * 8.0;

        // Avoid division by zero
        if (availableHours <= 0) {
            return 0.0;
        }

        // =====================================================
        // UTILIZATION %
        // =====================================================

        double utilization =
                (bookedHours / availableHours) * 100;

        // Prevent percentage greater than 100
        if (utilization > 100) {
            utilization = 100;
        }

        if (utilization < 0) {
            utilization = 0;
        }

        // Round to 2 decimal places
        return Math.round(
                utilization * 100.0
        ) / 100.0;
    }


    // =========================================================
// - DEMAND ANALYSIS
// =========================================================

@Override
public List<DemandAnalysisResponse> getDemandAnalysis(
        LocalDate startDate,
        LocalDate endDate) {

    // ---------------------------------------------------------
    // Validate dates
    // ---------------------------------------------------------

    if (startDate == null || endDate == null) {
        throw new RuntimeException(
                "Start date and end date are required."
        );
    }

    if (endDate.isBefore(startDate)) {
        throw new RuntimeException(
                "End date cannot be before start date."
        );
    }

    // ---------------------------------------------------------
    // Get all equipment
    // ---------------------------------------------------------

    List<Equipment> equipmentList =
            equipmentRepository.findAll();

    // ---------------------------------------------------------
    // Get bookings in selected date range
    // ---------------------------------------------------------

    List<Booking> bookings =
            bookingRepository.findByBookingDateBetween(
                    startDate,
                    endDate
            );

    List<DemandAnalysisResponse> results =
            new ArrayList<>();

    // ---------------------------------------------------------
    // Analyze every equipment
    // ---------------------------------------------------------

    for (Equipment equipment : equipmentList) {

        long bookingCount = 0;

        for (Booking booking : bookings) {

            if (booking.getEquipment() == null) {
                continue;
            }

            if (!equipment.getId()
                    .equals(booking.getEquipment().getId())) {

                continue;
            }

            // Ignore cancelled and no-show bookings
            if (booking.getStatus()
                    == BookingStatus.CANCELLED
                    ||
                booking.getStatus()
                    == BookingStatus.NO_SHOW) {

                continue;
            }

            bookingCount++;
        }

        // -----------------------------------------------------
        // Determine demand level
        // -----------------------------------------------------

        String demandLevel;

        if (bookingCount >= 10) {

            demandLevel = "HIGH";

        } else if (bookingCount >= 5) {

            demandLevel = "MEDIUM";

        } else {

            demandLevel = "LOW";
        }

        // -----------------------------------------------------
        // Create response
        // -----------------------------------------------------

        DemandAnalysisResponse response =
                new DemandAnalysisResponse(
                        equipment.getId(),
                        equipment.getName(),
                        equipment.getAssetTag(),
                        bookingCount,
                        demandLevel
                );

        results.add(response);
    }

    // ---------------------------------------------------------
    // Sort by booking count - highest first
    // ---------------------------------------------------------

    results.sort(
            Comparator.comparingLong(
                    DemandAnalysisResponse::getBookingCount
            ).reversed()
    );

    return results;
}


// =========================================================
// 5.16.4 - DEMAND TRENDS
// =========================================================

@Override
public List<DemandTrendResponse> getDemandTrends(
        LocalDate startDate,
        LocalDate endDate) {

    // ---------------------------------------------------------
    // Validate dates
    // ---------------------------------------------------------

    if (startDate == null || endDate == null) {
        throw new RuntimeException(
                "Start date and end date are required."
        );
    }

    if (endDate.isBefore(startDate)) {
        throw new RuntimeException(
                "End date cannot be before start date."
        );
    }

    // ---------------------------------------------------------
    // Get bookings in selected date range
    // ---------------------------------------------------------

    List<Booking> bookings =
            bookingRepository.findByBookingDateBetween(
                    startDate,
                    endDate
            );

    List<DemandTrendResponse> results =
            new ArrayList<>();

    // ---------------------------------------------------------
    // Generate data for every day
    // ---------------------------------------------------------

    LocalDate currentDate = startDate;

    while (!currentDate.isAfter(endDate)) {

        long bookingCount = 0;

        for (Booking booking : bookings) {

            if (booking.getBookingDate() == null) {
                continue;
            }

            if (!currentDate.equals(
                    booking.getBookingDate())) {

                continue;
            }

            // Ignore cancelled bookings
            if (booking.getStatus()
                    == BookingStatus.CANCELLED) {

                continue;
            }

            // Ignore no-show bookings
            if (booking.getStatus()
                    == BookingStatus.NO_SHOW) {

                continue;
            }

            bookingCount++;
        }

        results.add(
                new DemandTrendResponse(
                        currentDate,
                        bookingCount
                )
        );

        currentDate =
                currentDate.plusDays(1);
    }

    return results;
}


// =========================================================
// UTILIZATION REPORT
// =========================================================

@Override
public UtilizationReportResponse getUtilizationReport(
        LocalDate startDate,
        LocalDate endDate) {

    // ---------------------------------------------------------
    // Validate dates
    // ---------------------------------------------------------

    if (startDate == null || endDate == null) {
        throw new RuntimeException(
                "Start date and end date are required."
        );
    }

    if (endDate.isBefore(startDate)) {
        throw new RuntimeException(
                "End date cannot be before start date."
        );
    }

    // ---------------------------------------------------------
    // Get all equipment
    // ---------------------------------------------------------

    List<Equipment> equipmentList =
            equipmentRepository.findAll();

    // ---------------------------------------------------------
    // Get bookings in selected date range
    // ---------------------------------------------------------

    List<Booking> bookings =
            bookingRepository.findByBookingDateBetween(
                    startDate,
                    endDate
            );

    // ---------------------------------------------------------
    // Create report
    // ---------------------------------------------------------

    UtilizationReportResponse report =
            new UtilizationReportResponse();

    report.setStartDate(startDate);
    report.setEndDate(endDate);

    report.setTotalEquipment(
            equipmentList.size()
    );

    // ---------------------------------------------------------
    // Count valid bookings
    // ---------------------------------------------------------

    long totalBookings = bookings.stream()
            .filter(booking ->
                    booking.getStatus() != null
                    &&
                    booking.getStatus()
                            != BookingStatus.CANCELLED
                    &&
                    booking.getStatus()
                            != BookingStatus.NO_SHOW
            )
            .count();

    report.setTotalBookings(totalBookings);

    // ---------------------------------------------------------
    // Calculate utilization for every equipment
    // ---------------------------------------------------------

    List<EquipmentRankingResponse> rankings =
            getEquipmentRanking(
                    startDate,
                    endDate
            );

    // ---------------------------------------------------------
    // Average utilization
    // ---------------------------------------------------------

    double averageUtilization = 0.0;

    if (!rankings.isEmpty()) {

        double totalUtilization =
                rankings.stream()
                        .mapToDouble(
                                EquipmentRankingResponse
                                        ::getUtilizationPercentage
                        )
                        .sum();

        averageUtilization =
                totalUtilization / rankings.size();
    }

    averageUtilization =
            Math.round(
                    averageUtilization * 100.0
            ) / 100.0;

    report.setAverageUtilization(
            averageUtilization
    );

    // ---------------------------------------------------------
    // Highest utilized equipment
    // ---------------------------------------------------------

    if (!rankings.isEmpty()) {

        EquipmentRankingResponse highest =
                rankings.get(0);

        report.setHighestUtilizedEquipment(
                new UtilizationReportResponse
                        .EquipmentUtilizationSummary(
                                highest.getEquipmentId(),
                                highest.getEquipmentName(),
                                highest.getAssetTag(),
                                highest.getUtilizationPercentage()
                        )
        );
    }

    // ---------------------------------------------------------
    // Lowest utilized equipment
    // ---------------------------------------------------------

    if (!rankings.isEmpty()) {

        EquipmentRankingResponse lowest =
                rankings.get(
                        rankings.size() - 1
                );

        report.setLowestUtilizedEquipment(
                new UtilizationReportResponse
                        .EquipmentUtilizationSummary(
                                lowest.getEquipmentId(),
                                lowest.getEquipmentName(),
                                lowest.getAssetTag(),
                                lowest.getUtilizationPercentage()
                        )
        );
    }

    // ---------------------------------------------------------
    // Demand summary
    // ---------------------------------------------------------

    List<DemandAnalysisResponse> demandAnalysis =
            getDemandAnalysis(
                    startDate,
                    endDate
            );

    long highDemand =
            demandAnalysis.stream()
                    .filter(item ->
                            "HIGH".equalsIgnoreCase(
                                    item.getDemandLevel()
                            )
                    )
                    .count();

    long mediumDemand =
            demandAnalysis.stream()
                    .filter(item ->
                            "MEDIUM".equalsIgnoreCase(
                                    item.getDemandLevel()
                            )
                    )
                    .count();

    long lowDemand =
            demandAnalysis.stream()
                    .filter(item ->
                            "LOW".equalsIgnoreCase(
                                    item.getDemandLevel()
                            )
                    )
                    .count();

    report.setHighDemandEquipment(
            highDemand
    );

    report.setMediumDemandEquipment(
            mediumDemand
    );

    report.setLowDemandEquipment(
            lowDemand
    );

    return report;
}

    // =========================================================
    // VALID BOOKING STATUS
    // =========================================================

    private boolean isValidBookingStatus(
            BookingStatus status) {

        if (status == null) {
            return false;
        }

        /*
         * Adjust this list if your BookingStatus enum
         * uses different names.
         */

        return status == BookingStatus.CONFIRMED
                || status == BookingStatus.IN_USE
                || status == BookingStatus.COMPLETED;
    }


    // =========================================================
//  EQUIPMENT RANKING
// =========================================================

@Override
public List<EquipmentRankingResponse> getEquipmentRanking(
        LocalDate startDate,
        LocalDate endDate) {

    // ---------------------------------------------------------
    // Validate dates
    // ---------------------------------------------------------

    if (startDate == null || endDate == null) {
        throw new RuntimeException(
                "Start date and end date are required."
        );
    }

    if (endDate.isBefore(startDate)) {
        throw new RuntimeException(
                "End date cannot be before start date."
        );
    }

    // ---------------------------------------------------------
    // Get all equipment
    // ---------------------------------------------------------

    List<Equipment> equipmentList =
            equipmentRepository.findAll();

    List<EquipmentRankingResponse> results =
            new ArrayList<>();

    // ---------------------------------------------------------
    // Calculate utilization for every equipment
    // ---------------------------------------------------------

    for (Equipment equipment : equipmentList) {

        double utilization =
                calculateEquipmentUtilization(
                        equipment.getId(),
                        startDate,
                        endDate
                );

        EquipmentRankingResponse response =
                new EquipmentRankingResponse(
                        equipment.getId(),
                        equipment.getName(),
                        equipment.getAssetTag(),
                        utilization,
                        0
                );

        results.add(response);
    }

    // ---------------------------------------------------------
    // Sort highest utilization first
    // ---------------------------------------------------------

    results.sort(
            Comparator.comparingDouble(
                    EquipmentRankingResponse
                            ::getUtilizationPercentage
            ).reversed()
    );

    // ---------------------------------------------------------
    // Assign ranking
    // ---------------------------------------------------------

    for (int i = 0; i < results.size(); i++) {

        results.get(i).setRank(i + 1);
    }

    return results;
}
}