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
import com.labplatform.sharing.model.AccessRequest;
import com.labplatform.sharing.model.AccessRequestStatus;
import com.labplatform.sharing.repository.AccessRequestRepository;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final InstitutionRepository institutionRepository;
    private final WorkOrderRepository workOrderRepository;
    private final AccessRequestRepository accessRequestRepository;

    public AnalyticsService(
            UserRepository userRepository,
            BookingRepository bookingRepository,
            EquipmentRepository equipmentRepository,
            InstitutionRepository institutionRepository,
            WorkOrderRepository workOrderRepository,
            AccessRequestRepository accessRequestRepository) {

        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.institutionRepository = institutionRepository;
        this.workOrderRepository = workOrderRepository;
        this.accessRequestRepository = accessRequestRepository;
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


        // =====================================================
        // SYSTEM ADMIN
        // =====================================================

        if (role.equals("SYSTEM_ADMIN")) {
            return buildSystemStats();
        }


        // =====================================================
        // INSTITUTION ADMIN
        // =====================================================

        if (role.equals("INSTITUTION_ADMIN")) {
            return buildInstitutionAdminStats(user);
        }


        // =====================================================
        // LAB MANAGER / DEPARTMENT HEAD
        // =====================================================

        if (
                role.equals("LAB_MANAGER")
                        || role.equals("DEPARTMENT_HEAD")
        ) {
            return buildAdminStats(user);
        }


        // =====================================================
        // RESEARCHER / STUDENT
        // =====================================================

        return buildResearcherStats(user);
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

                            history.put(
                                    "id",
                                    b.getId()
                            );

                            history.put(
                                    "equipmentName",
                                    b.getEquipment() != null
                                            ? b.getEquipment()
                                            .getEquipmentName()
                                            : "Unknown Equipment"
                            );

                            history.put(
                                    "bookingDate",
                                    b.getBookingDate()
                            );

                            history.put(
                                    "startTime",
                                    b.getStartTime()
                            );

                            history.put(
                                    "endTime",
                                    b.getEndTime()
                            );

                            history.put(
                                    "durationHours",
                                    b.getDurationHours() != null
                                            ? b.getDurationHours()
                                            : 0
                            );

                            history.put(
                                    "purpose",
                                    b.getPurpose()
                            );

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
    // LAB MANAGER / DEPARTMENT HEAD ANALYTICS
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
        // GET INSTITUTION EQUIPMENT
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
        // GET EQUIPMENT IDS
        // =====================================================

        List<Long> equipmentIds =
                institutionEquipment.stream()

                        .map(Equipment::getId)

                        .collect(
                                Collectors.toList()
                        );


        // =====================================================
        // GET INSTITUTION BOOKINGS
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
        // =====================================================

        double noShowRate = 0.0;

        if (!institutionBookings.isEmpty()) {

            noShowRate =
                    (
                            (double) noShowBookings
                                    / institutionBookings.size()
                    )
                            * 100.0;
        }


        response.setInstitutionNoShowRate(
                roundOneDecimal(noShowRate)
        );


        // =====================================================
        // COMPLETION RATE
        // =====================================================

        double completionRate = 0.0;

        if (!institutionBookings.isEmpty()) {

            completionRate =
                    (
                            (double) completedBookings
                                    / institutionBookings.size()
                    )
                            * 100.0;
        }


        response.setInstitutionCompletionRate(
                roundOneDecimal(completionRate)
        );


        // =====================================================
        // AVERAGE UTILIZATION
        // =====================================================

        double maxHours =
                30 * 8;


        double avgUtil =
                institutionEquipment.isEmpty()
                        ? 0.0
                        : institutionEquipment.stream()

                        .mapToDouble(eq -> {

                            int hours =
                                    institutionBookings.stream()

                                            .filter(b ->
                                                    b.getEquipment() != null
                                                            &&
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

                        .orElse(0.0);


        response.setInstitutionAvgUtilization(
                roundOneDecimal(avgUtil)
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
        // =====================================================
// RESOURCE SHARING ANALYTICS
// =====================================================

        List<AccessRequest> pendingSharingRequests =
                accessRequestRepository
                        .findByOwningInstitutionIdAndStatus(
                                institutionId,
                                AccessRequestStatus.PENDING
                        );

        List<AccessRequest> approvedSharingRequests =
                accessRequestRepository
                        .findByOwningInstitutionIdAndStatus(
                                institutionId,
                                AccessRequestStatus.APPROVED
                        );

        List<AccessRequest> rejectedSharingRequests =
                accessRequestRepository
                        .findByOwningInstitutionIdAndStatus(
                                institutionId,
                                AccessRequestStatus.REJECTED
                        );

        int pendingSharing = pendingSharingRequests.size();
        int approvedSharing = approvedSharingRequests.size();
        int rejectedSharing = rejectedSharingRequests.size();

        int totalSharing =
                pendingSharing
                        + approvedSharing
                        + rejectedSharing;

        response.setInstitutionSharingRequests(totalSharing);

        response.setInstitutionApprovedSharingRequests(
                approvedSharing
        );

        response.setInstitutionPendingSharingRequests(
                pendingSharing
        );

        response.setInstitutionRejectedSharingRequests(
                rejectedSharing
        );


        return response;
    }


    // =========================================================
    // INSTITUTION ADMINISTRATOR ANALYTICS
    // =========================================================

    private AnalyticsResponse buildInstitutionAdminStats(
            User user) {

        AnalyticsResponse response =
                new AnalyticsResponse();

        response.setViewType("INSTITUTION_ADMIN");


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
        // GET ORGANIZATION EQUIPMENT
        // =====================================================

        List<Equipment> equipment =
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


        // =====================================================
        // EQUIPMENT IDS
        // =====================================================

        List<Long> equipmentIds =
                equipment.stream()

                        .map(Equipment::getId)

                        .collect(
                                Collectors.toList()
                        );


        // =====================================================
        // ORGANIZATION BOOKINGS
        // =====================================================

        List<Booking> bookings =
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


        // =====================================================
        // TOTAL EQUIPMENT
        // =====================================================

        response.setOrganizationTotalEquipment(
                equipment.size()
        );


        // =====================================================
        // TOTAL BOOKINGS
        // =====================================================

        response.setOrganizationTotalBookings(
                bookings.size()
        );


        // =====================================================
        // TOTAL USAGE HOURS
        // =====================================================

        int totalUsageHours =
                bookings.stream()

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


        response.setOrganizationTotalUsageHours(
                totalUsageHours
        );


        // =====================================================
        // ORGANIZATION AVERAGE UTILIZATION
        // =====================================================

        double maxHoursPerEquipment =
                30 * 8;


        double organizationUtilization =
                equipment.isEmpty()
                        ? 0.0
                        : equipment.stream()

                        .mapToDouble(eq -> {

                            int hours =
                                    bookings.stream()

                                            .filter(b ->
                                                    b.getEquipment() != null
                                                            &&
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
                                    (hours / maxHoursPerEquipment)
                                            * 100,
                                    100.0
                            );

                        })

                        .average()

                        .orElse(0.0);


        response.setOrganizationAvgUtilization(
                roundOneDecimal(
                        organizationUtilization
                )
        );


        // =====================================================
        // RESOURCE SHARING
        // =====================================================

        long crossInstitutionBookings =
                bookings.stream()

                        .filter(b ->
                                b.getUser() != null
                                        &&
                                        b.getUser()
                                                .getInstitution() != null
                                        &&
                                        b.getEquipment() != null
                                        &&
                                        b.getEquipment()
                                                .getInstitution() != null
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


        response.setOrganizationCrossInstitutionBookings(
                (int) crossInstitutionBookings
        );


        // =====================================================
        // SHARED RESOURCE COUNT
        // =====================================================

        long sharedResources =
                bookings.stream()

                        .filter(b ->
                                b.getUser() != null
                                        &&
                                        b.getUser()
                                                .getInstitution() != null
                                        &&
                                        b.getEquipment() != null
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

                        .map(b ->
                                b.getEquipment().getId()
                        )

                        .distinct()

                        .count();


        response.setOrganizationSharedResourceCount(
                (int) sharedResources
        );


        // =====================================================
        // COST ANALYSIS
        // =====================================================

        double totalPurchaseCost =
                equipment.stream()

                        .filter(e ->
                                e.getPurchaseCost() != null
                        )

                        .mapToDouble(e ->
                                e.getPurchaseCost().doubleValue()
                        )

                        .sum();


        response.setOrganizationTotalPurchaseCost(
                roundTwoDecimal(
                        totalPurchaseCost
                )
        );


        // =====================================================
        // AVERAGE EQUIPMENT COST
        // =====================================================

        double averageEquipmentCost =
                equipment.stream()

                        .filter(e ->
                                e.getPurchaseCost() != null
                        )

                        .mapToDouble(e ->
                                e.getPurchaseCost().doubleValue()
                        )

                        .average()

                        .orElse(0.0);


        response.setOrganizationAverageEquipmentCost(
                roundTwoDecimal(
                        averageEquipmentCost
                )
        );


        // =====================================================
        // ESTIMATED USAGE VALUE
        //
        // Usage value =
        // duration hours × hourly rate
        // =====================================================

        double estimatedUsageValue =
                bookings.stream()

                        .filter(b ->
                                b.getEquipment() != null
                                        &&
                                        b.getDurationHours() != null
                        )

                        .filter(b ->
                                b.getBookingStatus() ==
                                        BookingStatus.CONFIRMED
                                        ||
                                        b.getBookingStatus() ==
                                                BookingStatus.COMPLETED
                        )

                        .mapToDouble(b -> {

                            if (
                                    b.getEquipment()
                                            .getHourlyRate() == null
                            ) {
                                return 0.0;
                            }


                            double hourlyRate =
                                    b.getEquipment()
                                            .getHourlyRate()
                                            .doubleValue();


                            return hourlyRate *
                                    b.getDurationHours();

                        })

                        .sum();


        response.setOrganizationEstimatedUsageValue(
                roundTwoDecimal(
                        estimatedUsageValue
                )
        );


        // =====================================================
        // PROCUREMENT INSIGHTS
        // =====================================================

        int withPurchaseData =
                (int) equipment.stream()

                        .filter(e ->
                                e.getPurchaseDate() != null
                                        ||
                                        e.getPurchaseCost() != null
                        )

                        .count();


        int withoutPurchaseData =
                equipment.size() -
                        withPurchaseData;


        response.setOrganizationEquipmentWithPurchaseData(
                withPurchaseData
        );

        response.setOrganizationEquipmentWithoutPurchaseData(
                withoutPurchaseData
        );


        // =====================================================
        // TOP SUPPLIERS
        // =====================================================

        List<Map<String, Object>> topSuppliers =
                equipment.stream()

                        .filter(e ->
                                e.getSupplier() != null
                                        &&
                                        !e.getSupplier()
                                                .trim()
                                                .isEmpty()
                        )

                        .collect(
                                Collectors.groupingBy(
                                        e ->
                                                e.getSupplier()
                                                        .trim(),
                                        Collectors.counting()
                                )
                        )

                        .entrySet()

                        .stream()

                        .sorted(
                                Map.Entry
                                        .<String, Long>
                                                comparingByValue()
                                        .reversed()
                        )

                        .limit(5)

                        .map(entry -> {

                            Map<String, Object> supplier =
                                    new LinkedHashMap<>();

                            supplier.put(
                                    "supplier",
                                    entry.getKey()
                            );

                            supplier.put(
                                    "equipmentCount",
                                    entry.getValue()
                            );

                            return supplier;
                        })

                        .collect(
                                Collectors.toList()
                        );


        response.setOrganizationTopSuppliers(
                topSuppliers
        );


        // =====================================================
        // RECENT PURCHASES
        // =====================================================

        List<Map<String, Object>> recentPurchases =
                equipment.stream()

                        .filter(e ->
                                e.getPurchaseDate() != null
                        )

                        .sorted(
                                Comparator.comparing(
                                        Equipment::getPurchaseDate,
                                        Comparator.reverseOrder()
                                )
                        )

                        .limit(5)

                        .map(e -> {

                            Map<String, Object> purchase =
                                    new LinkedHashMap<>();

                            purchase.put(
                                    "equipmentName",
                                    e.getEquipmentName()
                            );

                            purchase.put(
                                    "purchaseDate",
                                    e.getPurchaseDate()
                            );

                            purchase.put(
                                    "purchaseCost",
                                    e.getPurchaseCost()
                            );

                            purchase.put(
                                    "supplier",
                                    e.getSupplier()
                            );

                            return purchase;
                        })

                        .collect(
                                Collectors.toList()
                        );


        response.setOrganizationRecentPurchases(
                recentPurchases
        );


        // =====================================================
        // EQUIPMENT LIFECYCLE
        // =====================================================

        LocalDate today =
                LocalDate.now();


        int activeEquipment = 0;

        int oldEquipment = 0;

        int veryOldEquipment = 0;


        List<Map<String, Object>> lifecycleEquipment =
                new ArrayList<>();


        for (Equipment eq : equipment) {

            if (eq.getPurchaseDate() == null) {
                continue;
            }


            int age =
                    Period.between(
                            eq.getPurchaseDate(),
                            today
                    ).getYears();


            String lifecycleStatus;


            if (age >= 10) {

                veryOldEquipment++;

                lifecycleStatus =
                        "VERY_OLD";

            } else if (age >= 5) {

                oldEquipment++;

                lifecycleStatus =
                        "OLD";

            } else {

                activeEquipment++;

                lifecycleStatus =
                        "ACTIVE";
            }


            Map<String, Object> item =
                    new LinkedHashMap<>();


            item.put(
                    "equipmentName",
                    eq.getEquipmentName()
            );

            item.put(
                    "purchaseDate",
                    eq.getPurchaseDate()
            );

            item.put(
                    "ageYears",
                    age
            );

            item.put(
                    "lifecycleStatus",
                    lifecycleStatus
            );


            lifecycleEquipment.add(
                    item
            );
        }


        response.setOrganizationActiveEquipment(
                activeEquipment
        );

        response.setOrganizationOldEquipment(
                oldEquipment
        );

        response.setOrganizationVeryOldEquipment(
                veryOldEquipment
        );


        lifecycleEquipment.sort(
                (a, b) ->
                        Integer.compare(
                                (Integer) b.get("ageYears"),
                                (Integer) a.get("ageYears")
                        )
        );


        response.setOrganizationLifecycleEquipment(
                lifecycleEquipment.stream()

                        .limit(10)

                        .collect(
                                Collectors.toList()
                        )
        );


        // =====================================================
        // ROI
        //
        // ROI =
        // ((usage value - purchase cost)
        // / purchase cost) × 100
        // =====================================================

        double estimatedROI =
                0.0;


        if (totalPurchaseCost > 0) {

            estimatedROI =
                    (
                            (
                                    estimatedUsageValue
                                            - totalPurchaseCost
                            )
                                    /
                                    totalPurchaseCost
                    )
                            * 100.0;
        }


        response.setOrganizationEstimatedROI(
                roundTwoDecimal(
                        estimatedROI
                )
        );


        // =====================================================
        // TOP ROI EQUIPMENT
        // =====================================================

        List<Map<String, Object>> topROIEquipment =
                equipment.stream()

                        .filter(e ->
                                e.getPurchaseCost() != null
                                        &&
                                        e.getPurchaseCost()
                                                .doubleValue() > 0
                        )

                        .map(eq -> {

                            double usageValue =
                                    bookings.stream()

                                            .filter(b ->
                                                    b.getEquipment() != null
                                                            &&
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

                                            .mapToDouble(b -> {

                                                if (
                                                        b.getDurationHours()
                                                                == null
                                                ) {
                                                    return 0.0;
                                                }


                                                if (
                                                        eq.getHourlyRate()
                                                                == null
                                                ) {
                                                    return 0.0;
                                                }


                                                double rate =
                                                        eq.getHourlyRate()
                                                                .doubleValue();


                                                return rate *
                                                        b.getDurationHours();

                                            })

                                            .sum();


                            double purchaseCost =
                                    eq.getPurchaseCost()
                                            .doubleValue();


                            double roi =
                                    (
                                            (
                                                    usageValue
                                                            - purchaseCost
                                            )
                                                    /
                                                    purchaseCost
                                    )
                                            * 100.0;


                            Map<String, Object> item =
                                    new LinkedHashMap<>();


                            item.put(
                                    "equipmentName",
                                    eq.getEquipmentName()
                            );

                            item.put(
                                    "purchaseCost",
                                    eq.getPurchaseCost()
                            );

                            item.put(
                                    "usageValue",
                                    roundTwoDecimal(
                                            usageValue
                                    )
                            );

                            item.put(
                                    "roi",
                                    roundTwoDecimal(
                                            roi
                                    )
                            );


                            return item;

                        })

                        .sorted(
                                (a, b) ->
                                        Double.compare(
                                                (Double) b.get("roi"),
                                                (Double) a.get("roi")
                                        )
                        )

                        .limit(5)

                        .collect(
                                Collectors.toList()
                        );


        response.setOrganizationTopROIEquipment(
                topROIEquipment
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
                                        b.getUser()
                                                .getInstitution() != null
                                        &&
                                        b.getEquipment() != null
                                        &&
                                        b.getEquipment()
                                                .getInstitution() != null
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


    // =========================================================
    // UTILITY METHODS
    // =========================================================

    private double roundOneDecimal(
            double value) {

        return Math.round(
                value * 10.0
        ) / 10.0;
    }


    private double roundTwoDecimal(
            double value) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }
}