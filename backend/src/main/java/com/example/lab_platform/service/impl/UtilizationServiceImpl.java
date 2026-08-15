package com.example.lab_platform.service.impl;

import java.util.Comparator;
import com.example.lab_platform.dto.UtilizationDTO;
import com.example.lab_platform.dto.UtilizationSummaryDTO;
import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.WaitlistRepository;
import com.example.lab_platform.service.UtilizationService;


import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.List;

@Service
public class UtilizationServiceImpl implements UtilizationService {

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final WaitlistRepository waitlistRepository;

    public UtilizationServiceImpl(
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            WaitlistRepository waitlistRepository) {

        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
        this.waitlistRepository = waitlistRepository;
    }

    @Override
    public List<UtilizationDTO> getUtilizationData() {

        List<Equipment> equipments = equipmentRepository.findAll();
        List<Booking> bookings = bookingRepository.findAll();

        List<UtilizationDTO> result = new ArrayList<>();

        /*
         * Task 2 analysis period:
         * Last 7 days including today.
         */
        LocalDate today = LocalDate.now();
        LocalDate periodStart = today.minusDays(6);

        LocalDateTime periodStartDateTime =
                periodStart.atStartOfDay();

        LocalDateTime periodEndDateTime =
                today.plusDays(1).atStartOfDay();

        /*
         * Total available hours during the 7-day period.
         */
        double totalPeriodHours = Duration.between(
                periodStartDateTime,
                periodEndDateTime
        ).toMinutes() / 60.0;

        for (Equipment equipment : equipments) {

            double usedHours = 0.0;

            double mondayHours = 0.0;
            double tuesdayHours = 0.0;
            double wednesdayHours = 0.0;
            double thursdayHours = 0.0;
            double fridayHours = 0.0;

            LocalDate latestUsedDate = null;

            // ===== NEW: demand analysis counter =====
            long bookingCount = 0;

            for (Booking booking : bookings) {

                if (booking.getEquipment() == null) {
                    continue;
                }

                if (!booking.getEquipment()
                        .getEquipmentId()
                        .equals(equipment.getEquipmentId())) {
                    continue;
                }

                if (booking.getStartTime() == null ||
                    booking.getEndTime() == null) {
                    continue;
                }

                String status = booking.getBookingStatus();

                if (status == null) {
                    continue;
                }

                status = status.trim().toLowerCase();

                /*
                 * Only actual/valid bookings contribute to utilization.
                 */
                if (!(status.equals("completed")
                        || status.equals("confirmed")
                        || status.equals("approved"))) {
                    continue;
                }

                LocalDateTime bookingStart = booking.getStartTime();
                LocalDateTime bookingEnd = booking.getEndTime();

                /*
                 * Ignore bookings completely outside our
                 * seven-day analysis period.
                 */
                if (!bookingEnd.isAfter(periodStartDateTime)
                        || !bookingStart.isBefore(periodEndDateTime)) {
                    continue;
                }

                // ===== NEW: this booking counts toward demand =====
                bookingCount++;

                /*
                 * Clip booking to the seven-day analysis period.
                 */
                LocalDateTime effectiveStart =
                        bookingStart.isBefore(periodStartDateTime)
                                ? periodStartDateTime
                                : bookingStart;

                LocalDateTime effectiveEnd =
                        bookingEnd.isAfter(periodEndDateTime)
                                ? periodEndDateTime
                                : bookingEnd;

                if (!effectiveEnd.isAfter(effectiveStart)) {
                    continue;
                }

                double bookingHours =
                        Duration.between(
                                effectiveStart,
                                effectiveEnd
                        ).toMinutes() / 60.0;

                usedHours += bookingHours;

                /*
                 * Latest date used.
                 */
                LocalDate bookingDate =
                        effectiveStart.toLocalDate();

                if (latestUsedDate == null
                        || bookingDate.isAfter(latestUsedDate)) {

                    latestUsedDate = bookingDate;
                }

                /*
                 * Daily heatmap data.
                 *
                 * Only Monday-Friday are required by
                 * the existing DTO.
                 */
                LocalDate currentDate =
                        effectiveStart.toLocalDate();

                while (!currentDate.isAfter(
                        effectiveEnd.toLocalDate())) {

                    LocalDateTime dayStart =
                            currentDate.atStartOfDay();

                    LocalDateTime dayEnd =
                            currentDate.plusDays(1)
                                    .atStartOfDay();

                    LocalDateTime overlapStart =
                            effectiveStart.isAfter(dayStart)
                                    ? effectiveStart
                                    : dayStart;

                    LocalDateTime overlapEnd =
                            effectiveEnd.isBefore(dayEnd)
                                    ? effectiveEnd
                                    : dayEnd;

                    if (overlapEnd.isAfter(overlapStart)) {

                        double dailyHours =
                                Duration.between(
                                        overlapStart,
                                        overlapEnd
                                ).toMinutes() / 60.0;

                        DayOfWeek day =
                                currentDate.getDayOfWeek();

                        switch (day) {

                            case MONDAY:
                                mondayHours += dailyHours;
                                break;

                            case TUESDAY:
                                tuesdayHours += dailyHours;
                                break;

                            case WEDNESDAY:
                                wednesdayHours += dailyHours;
                                break;

                            case THURSDAY:
                                thursdayHours += dailyHours;
                                break;

                            case FRIDAY:
                                fridayHours += dailyHours;
                                break;

                            default:
                                break;
                        }
                    }

                    currentDate =
                            currentDate.plusDays(1);
                }
            }

            /*
             * Prevent impossible utilization values.
             */
            if (usedHours > totalPeriodHours) {
                usedHours = totalPeriodHours;
            }

            double idleHours =
                    Math.max(
                            0.0,
                            totalPeriodHours - usedHours
                    );

            double utilizationPercentage =
                    totalPeriodHours > 0
                            ? (usedHours / totalPeriodHours) * 100.0
                            : 0.0;

            /*
             * High / Medium / Low classification.
             */
            String category;

            if (utilizationPercentage >= 70) {
                category = "HIGH";
            } else if (utilizationPercentage >= 30) {
                category = "MEDIUM";
            } else {
                category = "LOW";
            }

            /*
             * Idle days.
             */
            long idleDays = 0;

            if (latestUsedDate != null) {

                idleDays = Duration.between(
                        latestUsedDate.atStartOfDay(),
                        LocalDateTime.now()
                ).toDays();

                if (idleDays < 0) {
                    idleDays = 0;
                }

            } else {

                /*
                 * If equipment has never been used
                 * during the period, consider the entire
                 * seven-day period idle.
                 */
                idleDays = 7;
            }

            // ===== NEW: active waitlist size for this equipment =====
            long waitlistCount =
                    waitlistRepository
                            .findByEquipment_EquipmentIdAndWaitlistStatusOrderByCreatedAtAsc(
                                    equipment.getEquipmentId(),
                                    "WAITING"
                            )
                            .size();

            UtilizationDTO dto =
                    new UtilizationDTO();

            dto.setEquipmentName(
                    equipment.getEquipmentName()
            );

            dto.setUsedHours(
                    round(usedHours)
            );

            dto.setIdleHours(
                    round(idleHours)
            );

            dto.setUtilizationPercentage(
                    round(utilizationPercentage)
            );

            dto.setCategory(category);

            dto.setIdleDays(idleDays);

            /*
             * Heatmap values.
             */
            dto.setMonday(
                    getHeatmapLevel(mondayHours)
            );

            dto.setTuesday(
                    getHeatmapLevel(tuesdayHours)
            );

            dto.setWednesday(
                    getHeatmapLevel(wednesdayHours)
            );

            dto.setThursday(
                    getHeatmapLevel(thursdayHours)
            );

            dto.setFriday(
                    getHeatmapLevel(fridayHours)
            );

            // ===== NEW: demand analysis fields =====
            dto.setBookingCount(bookingCount);

            dto.setWaitlistCount(waitlistCount);

            result.add(dto);
        }
        //logic for summary
result.sort(
    Comparator.comparingLong(UtilizationDTO::getBookingCount).reversed()
);

return result;

    }

    /*
     * Heatmap classification:
     *
     * 0 hours       = IDLE
     * < 2 hours     = LOW
     * 2-4 hours     = MEDIUM
     * > 4 hours     = HIGH
     */
    private String getHeatmapLevel(double hours) {

        if (hours <= 0) {
            return "IDLE";
        }

        if (hours < 2) {
            return "LOW";
        }

        if (hours <= 4) {
            return "MEDIUM";
        }

        return "HIGH";
    }

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }
    //analytic summary
    @Override
public UtilizationSummaryDTO getUtilizationSummary() {

    List<UtilizationDTO> utilizationData = getUtilizationData();

    UtilizationSummaryDTO summary = new UtilizationSummaryDTO();

    summary.setTotalEquipment(utilizationData.size());

    if (utilizationData.isEmpty()) {
        return summary;
    }

    double averageUtilization = utilizationData.stream()
            .mapToDouble(UtilizationDTO::getUtilizationPercentage)
            .average()
            .orElse(0);

   summary.setAverageUtilization(round(averageUtilization));

    summary.setMostRequestedEquipment(
            utilizationData.stream()
                    .max(Comparator.comparingLong(UtilizationDTO::getBookingCount))
                    .map(UtilizationDTO::getEquipmentName)
                    .orElse("N/A")
    );

    summary.setHighestUtilizationEquipment(
            utilizationData.stream()
                    .max(Comparator.comparingDouble(UtilizationDTO::getUtilizationPercentage))
                    .map(UtilizationDTO::getEquipmentName)
                    .orElse("N/A")
    );

    summary.setLowestUtilizationEquipment(
            utilizationData.stream()
                    .min(Comparator.comparingDouble(UtilizationDTO::getUtilizationPercentage))
                    .map(UtilizationDTO::getEquipmentName)
                    .orElse("N/A")
    );

    return summary;
}
}