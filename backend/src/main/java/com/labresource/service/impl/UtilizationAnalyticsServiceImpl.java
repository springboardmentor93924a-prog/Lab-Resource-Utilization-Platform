package com.labresource.service.impl;

import com.labresource.dto.HeatmapDataResponseDto;
import com.labresource.dto.UtilizationAnalyticsResponseDto;
import com.labresource.entity.Booking;
import com.labresource.entity.Equipment;
import com.labresource.entity.ResourceSharingRequest;
import com.labresource.entity.UtilizationLog;
import com.labresource.repository.BookingRepository;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.ResourceSharingRequestRepository;
import com.labresource.repository.UtilizationLogRepository;
import com.labresource.service.UtilizationAnalyticsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class UtilizationAnalyticsServiceImpl
        implements UtilizationAnalyticsService {


    private static final int ANALYTICS_PERIOD_DAYS = 30;


    private static final long AVAILABLE_MINUTES_PER_DAY =
            24L * 60L;

    private final UtilizationLogRepository utilizationLogRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final ResourceSharingRequestRepository
            resourceSharingRequestRepository;

    public UtilizationAnalyticsServiceImpl(
            UtilizationLogRepository utilizationLogRepository,
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            ResourceSharingRequestRepository
                    resourceSharingRequestRepository
    ) {
        this.utilizationLogRepository = utilizationLogRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.resourceSharingRequestRepository =
                resourceSharingRequestRepository;
    }


    @Override
    public UtilizationAnalyticsResponseDto getUtilizationRate(
            String equipmentId
    ) {

        Equipment equipment = getEquipmentById(equipmentId);

        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate =
                endDate.minusDays(ANALYTICS_PERIOD_DAYS);

        List<UtilizationLog> logs =
                utilizationLogRepository
                        .findByEquipmentAndStartTimeBetween(
                                equipment,
                                startDate,
                                endDate
                        );

        long totalUsageMinutes =
                calculateTotalUsageMinutes(
                        logs,
                        startDate,
                        endDate
                );

        long availableMinutes =
                ANALYTICS_PERIOD_DAYS
                        * AVAILABLE_MINUTES_PER_DAY;

        long idleMinutes =
                Math.max(
                        availableMinutes - totalUsageMinutes,
                        0
                );

        double utilizationRate =
                calculatePercentage(
                        totalUsageMinutes,
                        availableMinutes
                );

        UtilizationAnalyticsResponseDto response =
                createBaseResponse(equipment);

        response.setTotalUsageMinutes(totalUsageMinutes);
        response.setAvailableMinutes(availableMinutes);
        response.setIdleMinutes(idleMinutes);
        response.setUtilizationRate(utilizationRate);

        response.setTotalBookings(
                countBookingsForEquipment(equipment)
        );

        response.setTotalRequests(
                countSharingRequestsForEquipment(equipment)
        );

        return response;
    }


    @Override
    public UtilizationAnalyticsResponseDto getIdleTime(
            String equipmentId
    ) {

        return getUtilizationRate(equipmentId);
    }


    @Override
    public List<UtilizationAnalyticsResponseDto>
    getIdleEquipments() {

        return equipmentRepository
                .findAll()
                .stream()
                .map(equipment ->
                        getUtilizationRate(equipment.getId())
                )
                .filter(response ->
                        response.getIdleMinutes() != null
                                && response.getIdleMinutes() > 0
                )
                .sorted(
                        Comparator.comparing(
                                UtilizationAnalyticsResponseDto
                                        ::getIdleMinutes
                        ).reversed()
                )
                .toList();
    }


    @Override
    public List<UtilizationAnalyticsResponseDto>
    getMostUsedEquipments() {

        return equipmentRepository
                .findAll()
                .stream()
                .map(equipment ->
                        getUtilizationRate(equipment.getId())
                )
                .sorted(
                        Comparator.comparing(
                                UtilizationAnalyticsResponseDto
                                        ::getTotalUsageMinutes
                        ).reversed()
                )
                .toList();
    }


    @Override
    public List<UtilizationAnalyticsResponseDto>
    getDemandAnalysis() {

        List<UtilizationAnalyticsResponseDto> responses =
                new ArrayList<>();

        for (Equipment equipment :
                equipmentRepository.findAll()) {

            UtilizationAnalyticsResponseDto response =
                    getUtilizationRate(equipment.getId());

            responses.add(response);
        }

        responses.sort(
                Comparator
                        .comparingLong(
                                this::calculateDemandScore
                        )
                        .reversed()
        );

        return responses;
    }


    @Override
    public List<HeatmapDataResponseDto> getHeatmapData(
            String equipmentId
    ) {

        Equipment equipment = getEquipmentById(equipmentId);

        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate =
                endDate.minusDays(ANALYTICS_PERIOD_DAYS);

        List<UtilizationLog> logs =
                utilizationLogRepository
                        .findByEquipmentAndStartTimeBetween(
                                equipment,
                                startDate,
                                endDate
                        );

        Map<DayOfWeek, Map<Integer, HeatmapAccumulator>>
                heatmap = new EnumMap<>(DayOfWeek.class);


        for (DayOfWeek day : DayOfWeek.values()) {

            Map<Integer, HeatmapAccumulator> hours =
                    new HashMap<>();

            for (int hour = 0; hour < 24; hour++) {
                hours.put(hour, new HeatmapAccumulator());
            }

            heatmap.put(day, hours);
        }

        for (UtilizationLog log : logs) {

            if (log.getStartTime() == null) {
                continue;
            }

            LocalDateTime logStart =
                    getLaterDateTime(
                            log.getStartTime(),
                            startDate
                    );

            LocalDateTime logEnd =
                    getEffectiveEndTime(log);

            logEnd = getEarlierDateTime(
                    logEnd,
                    endDate
            );

            if (!logEnd.isAfter(logStart)) {
                continue;
            }

            addLogToHeatmap(
                    logStart,
                    logEnd,
                    heatmap
            );
        }

        return convertHeatmapToResponse(heatmap);
    }


    private long calculateTotalUsageMinutes(
            List<UtilizationLog> logs,
            LocalDateTime rangeStart,
            LocalDateTime rangeEnd
    ) {

        long totalMinutes = 0;

        for (UtilizationLog log : logs) {

            if (log.getStartTime() == null) {
                continue;
            }

            LocalDateTime start =
                    getLaterDateTime(
                            log.getStartTime(),
                            rangeStart
                    );

            LocalDateTime end =
                    getEarlierDateTime(
                            getEffectiveEndTime(log),
                            rangeEnd
                    );

            if (end.isAfter(start)) {

                totalMinutes += Duration
                        .between(start, end)
                        .toMinutes();
            }
        }

        return totalMinutes;
    }


    private LocalDateTime getEffectiveEndTime(
            UtilizationLog log
    ) {

        if (log.getEndTime() != null) {
            return log.getEndTime();
        }

        if ("IN_USE".equalsIgnoreCase(log.getStatus())) {
            return LocalDateTime.now();
        }


        return log.getStartTime();
    }


    private void addLogToHeatmap(
            LocalDateTime start,
            LocalDateTime end,
            Map<DayOfWeek,
                    Map<Integer, HeatmapAccumulator>> heatmap
    ) {

        LocalDateTime current = start;

        while (current.isBefore(end)) {

            LocalDateTime nextHour =
                    current
                            .withMinute(0)
                            .withSecond(0)
                            .withNano(0)
                            .plusHours(1);

            LocalDateTime segmentEnd =
                    nextHour.isBefore(end)
                            ? nextHour
                            : end;

            long minutes = Duration
                    .between(current, segmentEnd)
                    .toMinutes();


            if (minutes == 0
                    && segmentEnd.isAfter(current)) {

                minutes = 1;
            }

            DayOfWeek day = current.getDayOfWeek();
            int hour = current.getHour();

            HeatmapAccumulator accumulator =
                    heatmap
                            .get(day)
                            .get(hour);

            accumulator.totalUsageMinutes += minutes;
            accumulator.usageCount++;

            current = segmentEnd;
        }
    }

    private List<HeatmapDataResponseDto>
    convertHeatmapToResponse(
            Map<DayOfWeek,
                    Map<Integer, HeatmapAccumulator>> heatmap
    ) {

        List<HeatmapDataResponseDto> response =
                new ArrayList<>();



        Map<DayOfWeek, Long> dayOccurrences =
                calculateDayOccurrences();

        for (DayOfWeek day : DayOfWeek.values()) {

            for (int hour = 0; hour < 24; hour++) {

                HeatmapAccumulator accumulator =
                        heatmap
                                .get(day)
                                .get(hour);

                long occurrences =
                        dayOccurrences.getOrDefault(
                                day,
                                1L
                        );


                long slotAvailableMinutes =
                        occurrences * 60L;

                double utilizationPercentage =
                        calculatePercentage(
                                accumulator.totalUsageMinutes,
                                slotAvailableMinutes
                        );

                response.add(
                        new HeatmapDataResponseDto(
                                day.name(),
                                hour,
                                accumulator.usageCount,
                                accumulator.totalUsageMinutes,
                                utilizationPercentage
                        )
                );
            }
        }

        return response;
    }

    private Map<DayOfWeek, Long>
    calculateDayOccurrences() {

        Map<DayOfWeek, Long> occurrences =
                new EnumMap<>(DayOfWeek.class);

        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime date =
                endDate.minusDays(
                        ANALYTICS_PERIOD_DAYS
                );

        while (!date.isAfter(endDate)) {

            DayOfWeek day = date.getDayOfWeek();

            occurrences.put(
                    day,
                    occurrences.getOrDefault(day, 0L) + 1
            );

            date = date.plusDays(1);
        }

        return occurrences;
    }

    private long countBookingsForEquipment(
            Equipment equipment
    ) {

        return bookingRepository
                .findAll()
                .stream()
                .filter(booking ->
                        booking.getEquipment() != null
                                && booking
                                .getEquipment()
                                .getId()
                                .equals(equipment.getId())
                )
                .count();
    }

    private long countSharingRequestsForEquipment(
            Equipment equipment
    ) {

        return resourceSharingRequestRepository
                .findAll()
                .stream()
                .filter(request ->
                        request.getEquipment() != null
                                && request
                                .getEquipment()
                                .getId()
                                .equals(equipment.getId())
                )
                .count();
    }


    private long calculateDemandScore(
            UtilizationAnalyticsResponseDto response
    ) {

        long bookings =
                response.getTotalBookings() == null
                        ? 0
                        : response.getTotalBookings();

        long requests =
                response.getTotalRequests() == null
                        ? 0
                        : response.getTotalRequests();

        return (bookings * 2) + requests;
    }

    private UtilizationAnalyticsResponseDto
    createBaseResponse(
            Equipment equipment
    ) {

        UtilizationAnalyticsResponseDto response =
                new UtilizationAnalyticsResponseDto();

        response.setEquipmentId(equipment.getId());
        response.setEquipmentName(equipment.getName());

        return response;
    }

    private Equipment getEquipmentById(
            String equipmentId
    ) {

        return equipmentRepository
                .findById(equipmentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Equipment not found"
                        )
                );
    }

    private double calculatePercentage(
            long usedValue,
            long totalValue
    ) {

        if (totalValue <= 0) {
            return 0.0;
        }

        double percentage =
                ((double) usedValue / totalValue) * 100;


        percentage = Math.min(percentage, 100.0);

        return Math.round(percentage * 100.0) / 100.0;
    }

    private LocalDateTime getLaterDateTime(
            LocalDateTime first,
            LocalDateTime second
    ) {

        return first.isAfter(second)
                ? first
                : second;
    }

    private LocalDateTime getEarlierDateTime(
            LocalDateTime first,
            LocalDateTime second
    ) {

        return first.isBefore(second)
                ? first
                : second;
    }


    private static class HeatmapAccumulator {

        private long usageCount;
        private long totalUsageMinutes;
    }
}