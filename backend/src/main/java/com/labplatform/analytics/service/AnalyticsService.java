package com.labplatform.analytics.service;

import com.labplatform.analytics.dto.AnalyticsResponse;
import com.labplatform.auth.model.User;
import com.labplatform.auth.repository.UserRepository;
import com.labplatform.booking.model.Booking;
import com.labplatform.booking.model.BookingStatus;
import com.labplatform.booking.repository.BookingRepository;
import com.labplatform.equipment.model.Equipment;
import com.labplatform.equipment.repository.EquipmentRepository;
import com.labplatform.institution.repository.InstitutionRepository;
import com.labplatform.maintenance.model.WorkOrderStatus;
import com.labplatform.maintenance.repository.WorkOrderRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final InstitutionRepository institutionRepository;
    private final WorkOrderRepository workOrderRepository;

    public AnalyticsService(
            UserRepository userRepository,
            BookingRepository bookingRepository,
            EquipmentRepository equipmentRepository,
            InstitutionRepository institutionRepository,
            WorkOrderRepository workOrderRepository) {

        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.institutionRepository = institutionRepository;
        this.workOrderRepository = workOrderRepository;
    }


    // =========================================================
    // MAIN ANALYTICS ENTRY POINT
    // =========================================================

    public AnalyticsResponse getMyAnalytics(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "User not found"
                        )
                );

        String role = user.getRole().getName();

        if (role.equals("SYSTEM_ADMIN")) {

            return buildSystemStats();

        } else if (
                role.equals("INSTITUTION_ADMIN")
                        || role.equals("LAB_MANAGER")
                        || role.equals("DEPARTMENT_HEAD")
        ) {

            return buildAdminStats(user);

        } else {

            return buildResearcherStats(user);
        }
    }


    // =========================================================
    // RESEARCHER / STUDENT ANALYTICS
    // =========================================================

    private AnalyticsResponse buildResearcherStats(User user) {

        AnalyticsResponse response =
                new AnalyticsResponse();

        response.setViewType("RESEARCHER");


        // =====================================================
        // GET USER BOOKINGS
        // =====================================================

        List<Booking> myBookings =
                bookingRepository.findByUserId(user.getId());


        // =====================================================
        // TOTAL BOOKINGS
        // =====================================================

        response.setMyTotalBookings(
                myBookings.size()
        );


        // =====================================================
        // TOTAL USAGE HOURS
        //
        // Only CONFIRMED and COMPLETED bookings
        // are counted as actual usage.
        // =====================================================

        int totalHours =
                myBookings.stream()

                        .filter(b ->
                                b.getBookingStatus() ==
                                        BookingStatus.CONFIRMED
                                        ||
                                        b.getBookingStatus() ==
                                                BookingStatus.COMPLETED
                        )

                        .mapToInt(b ->
                                b.getDurationHours() != null
                                        ? b.getDurationHours()
                                        : 0
                        )

                        .sum();

        response.setMyTotalUsageHours(
                totalHours
        );


        // =====================================================
        // MOST-BOOKED EQUIPMENT
        // =====================================================

        Map<String, Long> countByEquipment =
                myBookings.stream()

                        .filter(b ->
                                b.getEquipment() != null
                        )

                        .collect(
                                Collectors.groupingBy(
                                        b ->
                                                b.getEquipment()
                                                        .getEquipmentName(),
                                        Collectors.counting()
                                )
                        );


        List<Map<String, Object>> favorites =
                countByEquipment.entrySet()
                        .stream()

                        .sorted(
                                (a, b) ->
                                        Long.compare(
                                                b.getValue(),
                                                a.getValue()
                                        )
                        )

                        .limit(5)

                        .map(e -> {

                            Map<String, Object> m =
                                    new LinkedHashMap<>();

                            m.put(
                                    "equipmentName",
                                    e.getKey()
                            );

                            m.put(
                                    "bookingCount",
                                    e.getValue()
                            );

                            return m;
                        })

                        .collect(
                                Collectors.toList()
                        );


        response.setMyFavoriteEquipment(
                favorites
        );


        // =====================================================
        // USAGE HISTORY
        //
        // Shows the researcher's recent bookings.
        //
        // We include CONFIRMED and COMPLETED bookings
        // because these represent actual/approved usage.
        // =====================================================

        List<Map<String, Object>> usageHistory =
                myBookings.stream()

                        .filter(b ->
                                b.getBookingStatus() ==
                                        BookingStatus.CONFIRMED
                                        ||
                                        b.getBookingStatus() ==
                                                BookingStatus.COMPLETED
                        )

                        .sorted(
                                Comparator.comparing(
                                        Booking::getBookingDate,
                                        Comparator.nullsLast(
                                                Comparator.reverseOrder()
                                        )
                                )
                        )

                        .limit(10)

                        .map(b -> {

                            Map<String, Object> history =
                                    new LinkedHashMap<>();


                            // Booking ID

                            history.put(
                                    "id",
                                    b.getId()
                            );


                            // Equipment name

                            history.put(
                                    "equipmentName",
                                    b.getEquipment() != null
                                            ? b.getEquipment()
                                            .getEquipmentName()
                                            : "Unknown Equipment"
                            );


                            // Booking date

                            history.put(
                                    "bookingDate",
                                    b.getBookingDate()
                            );


                            // Start time

                            history.put(
                                    "startTime",
                                    b.getStartTime()
                            );


                            // End time

                            history.put(
                                    "endTime",
                                    b.getEndTime()
                            );


                            // Duration

                            history.put(
                                    "durationHours",
                                    b.getDurationHours() != null
                                            ? b.getDurationHours()
                                            : 0
                            );


                            // Purpose

                            history.put(
                                    "purpose",
                                    b.getPurpose()
                            );


                            // Status

                            history.put(
                                    "status",
                                    b.getBookingStatus() != null
                                            ? b.getBookingStatus().name()
                                            : "UNKNOWN"
                            );


                            return history;
                        })

                        .collect(
                                Collectors.toList()
                        );


        response.setMyUsageHistory(
                usageHistory
        );


        return response;
    }


    // =========================================================
    // ADMIN / LAB MANAGER ANALYTICS
    // =========================================================

    private AnalyticsResponse buildAdminStats(User user) {

        AnalyticsResponse response =
                new AnalyticsResponse();

        response.setViewType("ADMIN");


        // =====================================================
        // INSTITUTION CHECK
        // =====================================================

        if (user.getInstitution() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Your account has no institution assigned"
            );
        }


        Integer institutionId =
                user.getInstitution().getId();


        // =====================================================
        // INSTITUTION EQUIPMENT
        // =====================================================

        List<Equipment> institutionEquipment =
                equipmentRepository.findAll()
                        .stream()

                        .filter(e ->
                                e.getInstitution() != null
                                        &&
                                        e.getInstitution()
                                                .getId()
                                                .equals(institutionId)
                        )

                        .collect(
                                Collectors.toList()
                        );


        response.setInstitutionTotalEquipment(
                institutionEquipment.size()
        );


        // =====================================================
        // EQUIPMENT IDS
        // =====================================================

        List<Long> equipmentIds =
                institutionEquipment.stream()

                        .map(Equipment::getId)

                        .collect(
                                Collectors.toList()
                        );


        // =====================================================
        // INSTITUTION BOOKINGS
        // =====================================================

        List<Booking> institutionBookings =
                bookingRepository.findAll()
                        .stream()

                        .filter(b ->
                                b.getEquipment() != null
                                        &&
                                        equipmentIds.contains(
                                                b.getEquipment().getId()
                                        )
                        )

                        .collect(
                                Collectors.toList()
                        );


        response.setInstitutionTotalBookings(
                institutionBookings.size()
        );


        // =====================================================
        // BOOKING STATUS ANALYTICS
        //
        // Used for:
        // - Booking rate overview
        // - No-show rate
        // - Completion rate
        // =====================================================

        int confirmedBookings =
                (int) institutionBookings.stream()
                        .filter(b ->
                                b.getBookingStatus() ==
                                        BookingStatus.CONFIRMED
                        )
                        .count();


        int completedBookings =
                (int) institutionBookings.stream()
                        .filter(b ->
                                b.getBookingStatus() ==
                                        BookingStatus.COMPLETED
                        )
                        .count();


        int cancelledBookings =
                (int) institutionBookings.stream()
                        .filter(b ->
                                b.getBookingStatus() ==
                                        BookingStatus.CANCELLED
                        )
                        .count();


        int noShowBookings =
                (int) institutionBookings.stream()
                        .filter(b ->
                                b.getBookingStatus() ==
                                        BookingStatus.NO_SHOW
                        )
                        .count();


        response.setInstitutionConfirmedBookings(
                confirmedBookings
        );

        response.setInstitutionCompletedBookings(
                completedBookings
        );

        response.setInstitutionCancelledBookings(
                cancelledBookings
        );

        response.setInstitutionNoShowBookings(
                noShowBookings
        );


        // =====================================================
        // NO-SHOW RATE
        //
        // Formula:
        //
        // No-show rate =
        // (No-show bookings / Total bookings) * 100
        //
        // Rounded to one decimal place.
        // =====================================================

        double noShowRate = 0.0;

        if (!institutionBookings.isEmpty()) {

            noShowRate =
                    ((double) noShowBookings
                            / institutionBookings.size())
                            * 100.0;
        }


        response.setInstitutionNoShowRate(
                Math.round(noShowRate * 10.0) / 10.0
        );


        // =====================================================
        // COMPLETION RATE
        //
        // Formula:
        //
        // Completion rate =
        // (Completed bookings / Total bookings) * 100
        //
        // Rounded to one decimal place.
        // =====================================================

        double completionRate = 0.0;

        if (!institutionBookings.isEmpty()) {

            completionRate =
                    ((double) completedBookings
                            / institutionBookings.size())
                            * 100.0;
        }


        response.setInstitutionCompletionRate(
                Math.round(completionRate * 10.0) / 10.0
        );


        // =====================================================
        // AVERAGE UTILIZATION
        // =====================================================

        double maxHours =
                30 * 8;


        double avgUtil =
                institutionEquipment.isEmpty()
                        ? 0

                        : institutionEquipment.stream()

                        .mapToDouble(eq -> {

                            int hours =
                                    institutionBookings.stream()

                                            .filter(b ->
                                                    b.getEquipment()
                                                            .getId()
                                                            .equals(
                                                                    eq.getId()
                                                            )
                                            )

                                            .filter(b ->
                                                    b.getBookingStatus() ==
                                                            BookingStatus.CONFIRMED
                                                            ||
                                                            b.getBookingStatus() ==
                                                                    BookingStatus.COMPLETED
                                            )

                                            .mapToInt(b ->
                                                    b.getDurationHours() != null
                                                            ? b.getDurationHours()
                                                            : 0
                                            )

                                            .sum();


                            return Math.min(
                                    (hours / maxHours) * 100,
                                    100.0
                            );

                        })

                        .average()

                        .orElse(0);


        response.setInstitutionAvgUtilization(
                Math.round(
                        avgUtil * 10.0
                ) / 10.0
        );


        // =====================================================
        // TOP EQUIPMENT
        // =====================================================

        Map<String, Long> bookingCountByEquipment =
                institutionBookings.stream()

                        .filter(b ->
                                b.getEquipment() != null
                        )

                        .collect(
                                Collectors.groupingBy(
                                        b ->
                                                b.getEquipment()
                                                        .getEquipmentName(),
                                        Collectors.counting()
                                )
                        );


        List<Map<String, Object>> topEquipment =
                bookingCountByEquipment.entrySet()
                        .stream()

                        .sorted(
                                (a, b) ->
                                        Long.compare(
                                                b.getValue(),
                                                a.getValue()
                                        )
                        )

                        .limit(5)

                        .map(e -> {

                            Map<String, Object> m =
                                    new LinkedHashMap<>();

                            m.put(
                                    "equipmentName",
                                    e.getKey()
                            );

                            m.put(
                                    "bookingCount",
                                    e.getValue()
                            );

                            return m;
                        })

                        .collect(
                                Collectors.toList()
                        );


        response.setInstitutionTopEquipment(
                topEquipment
        );


        // =====================================================
        // OPEN WORK ORDERS
        // =====================================================

        long openWorkOrders =
                workOrderRepository.findAll()
                        .stream()

                        .filter(w ->
                                w.getEquipment() != null
                                        &&
                                        equipmentIds.contains(
                                                w.getEquipment().getId()
                                        )
                        )

                        .filter(w ->
                                w.getStatus() !=
                                        WorkOrderStatus.COMPLETED
                        )

                        .count();


        response.setInstitutionOpenWorkOrders(
                (int) openWorkOrders
        );


        return response;
    }


    // =========================================================
    // SYSTEM ADMIN ANALYTICS
    // =========================================================

    private AnalyticsResponse buildSystemStats() {

        AnalyticsResponse response =
                new AnalyticsResponse();

        response.setViewType("SYSTEM");


        // =====================================================
        // TOTAL INSTITUTIONS
        // =====================================================

        response.setSystemTotalInstitutions(
                (int) institutionRepository.count()
        );


        // =====================================================
        // TOTAL EQUIPMENT
        // =====================================================

        response.setSystemTotalEquipment(
                (int) equipmentRepository.count()
        );


        // =====================================================
        // TOTAL BOOKINGS
        // =====================================================

        response.setSystemTotalBookings(
                (int) bookingRepository.count()
        );


        // =====================================================
        // CROSS-INSTITUTION BOOKINGS
        // =====================================================

        long crossInstitution =
                bookingRepository.findAll()
                        .stream()

                        .filter(b ->
                                b.getUser() != null
                                        &&
                                        b.getUser().getInstitution() != null
                                        &&
                                        b.getEquipment() != null
                                        &&
                                        b.getEquipment().getInstitution() != null
                        )

                        .filter(b ->
                                !b.getUser()
                                        .getInstitution()
                                        .getId()
                                        .equals(
                                                b.getEquipment()
                                                        .getInstitution()
                                                        .getId()
                                        )
                        )

                        .count();


        response.setSystemCrossInstitutionBookings(
                (int) crossInstitution
        );


        return response;
    }
}