package com.example.lab_platform.service.impl;

import java.util.Comparator;
import com.example.lab_platform.dto.UtilizationDTO;
import com.example.lab_platform.dto.UtilizationSummaryDTO;
import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.User;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.WaitlistRepository;
import com.example.lab_platform.service.UtilizationService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    /*
     * Who sees which equipment:
     *   SYSTEM_ADMIN                       -> every institution
     *   INSTITUTION_ADMIN                  -> their own institution (all departments)
     *   LAB_MANAGER / DEPARTMENT_HEAD /
     *   LAB_TECHNICIAN                     -> their own department only
     *
     * Previously every role except SYSTEM_ADMIN got the whole institution,
     * so a CSE manager and an EEE manager saw identical data.
     */
    private List<Equipment> scopedEquipmentToOwnInstitution() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return equipmentRepository.findAll();
        }

        User loggedInUser = (User) authentication.getPrincipal();
        String role = loggedInUser.getRole().getRoleName();

        if ("SYSTEM_ADMIN".equalsIgnoreCase(role)) {
            return equipmentRepository.findAll();
        }

        if (loggedInUser.getInstitution() == null) {
            return new ArrayList<>();
        }

        Integer institutionId = loggedInUser.getInstitution().getInstitutionId();

        boolean departmentScoped = "LAB_MANAGER".equalsIgnoreCase(role)
                || "DEPARTMENT_HEAD".equalsIgnoreCase(role)
                || "LAB_TECHNICIAN".equalsIgnoreCase(role);

        if (departmentScoped && loggedInUser.getDepartment() == null) {
            return new ArrayList<>();
        }

        Integer departmentId = departmentScoped
                ? loggedInUser.getDepartment().getDepartmentId()
                : null;

        return equipmentRepository.findAll().stream()
                .filter(e -> e.getInstitution() != null
                        && institutionId.equals(e.getInstitution().getInstitutionId()))
                .filter(e -> departmentId == null
                        || (e.getDepartment() != null
                            && departmentId.equals(e.getDepartment().getDepartmentId())))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<UtilizationDTO> getUtilizationData() {

        List<Equipment> equipments = scopedEquipmentToOwnInstitution();
        List<Booking> bookings = bookingRepository.findAll();

        List<UtilizationDTO> result = new ArrayList<>();

        /*
         * Task 2 analysis period:
         * Last 7 days including today.
         */
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
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
            double saturdayHours = 0.0;
            double sundayHours = 0.0;

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
                 * "In Use" was missing here — equipment actively being
                 * used right now was being counted as NOT utilized
                 * until its booking later flipped to "Completed",
                 * which is exactly backwards and made currently-busy
                 * equipment look idle on the heatmap/demand analysis.
                 */
                if (!(status.equals("completed")
                        || status.equals("confirmed")
                        || status.equals("in use")
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

                /*
                 * Only time that has actually elapsed counts as usage.
                 * A confirmed booking for later today / tomorrow used to
                 * be counted as already-used, which made the heatmap,
                 * used hours and idle days disagree with each other.
                 */
                LocalDateTime usageCutoff =
                        periodEndDateTime.isAfter(now)
                                ? now
                                : periodEndDateTime;

                LocalDateTime effectiveEnd =
                        bookingEnd.isAfter(usageCutoff)
                                ? usageCutoff
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
                        effectiveEnd.minusSeconds(1).toLocalDate();

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

                            case SATURDAY:
                                saturdayHours += dailyHours;
                                break;

                            case SUNDAY:
                                sundayHours += dailyHours;
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
            long idleDays;

            if (latestUsedDate != null) {

                // Whole calendar days since the equipment was last
                // actually used (0 = used today).
                idleDays = java.time.temporal.ChronoUnit.DAYS.between(
                        latestUsedDate,
                        today
                );

            } else if (equipment.getLastUsedDate() != null) {

                // Not used in the 7-day window — fall back to the
                // stored last-used date so this matches reality.
                idleDays = java.time.temporal.ChronoUnit.DAYS.between(
                        equipment.getLastUsedDate(),
                        today
                );

            } else {

                // Never used at all: treat the whole 7-day period as idle.
                idleDays = 7;
            }

            if (idleDays < 0) {
                idleDays = 0;
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

            dto.setSaturday(
                    getHeatmapLevel(saturdayHours)
            );

            dto.setSunday(
                    getHeatmapLevel(sundayHours)
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