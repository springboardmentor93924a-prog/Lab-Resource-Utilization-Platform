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

    public AnalyticsService(UserRepository userRepository, BookingRepository bookingRepository,
                            EquipmentRepository equipmentRepository, InstitutionRepository institutionRepository,
                            WorkOrderRepository workOrderRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.institutionRepository = institutionRepository;
        this.workOrderRepository = workOrderRepository;
    }

    public AnalyticsResponse getMyAnalytics(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        String role = user.getRole().getName();

        if (role.equals("SYSTEM_ADMIN")) {
            return buildSystemStats();
        } else if (role.equals("INSTITUTION_ADMIN") || role.equals("LAB_MANAGER") || role.equals("DEPARTMENT_HEAD")) {
            return buildAdminStats(user);
        } else {
            return buildResearcherStats(user);
        }
    }

    private AnalyticsResponse buildResearcherStats(User user) {
        AnalyticsResponse response = new AnalyticsResponse();
        response.setViewType("RESEARCHER");

        List<Booking> myBookings = bookingRepository.findByUserId(user.getId());
        response.setMyTotalBookings(myBookings.size());

        int totalHours = myBookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED || b.getBookingStatus() == BookingStatus.COMPLETED)
                .mapToInt(b -> b.getDurationHours() != null ? b.getDurationHours() : 0)
                .sum();
        response.setMyTotalUsageHours(totalHours);

        Map<String, Long> countByEquipment = myBookings.stream()
                .collect(Collectors.groupingBy(b -> b.getEquipment().getEquipmentName(), Collectors.counting()));

        List<Map<String, Object>> favorites = countByEquipment.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("equipmentName", e.getKey());
                    m.put("bookingCount", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());
        response.setMyFavoriteEquipment(favorites);

        return response;
    }

    private AnalyticsResponse buildAdminStats(User user) {
        AnalyticsResponse response = new AnalyticsResponse();
        response.setViewType("ADMIN");

        if (user.getInstitution() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Your account has no institution assigned");
        }
        Integer institutionId = user.getInstitution().getId();

        List<Equipment> institutionEquipment = equipmentRepository.findAll().stream()
                .filter(e -> e.getInstitution() != null && e.getInstitution().getId().equals(institutionId))
                .collect(Collectors.toList());
        response.setInstitutionTotalEquipment(institutionEquipment.size());

        List<Long> equipmentIds = institutionEquipment.stream().map(Equipment::getId).collect(Collectors.toList());

        List<Booking> institutionBookings = bookingRepository.findAll().stream()
                .filter(b -> equipmentIds.contains(b.getEquipment().getId()))
                .collect(Collectors.toList());
        response.setInstitutionTotalBookings(institutionBookings.size());

        double maxHours = 30 * 8;
        double avgUtil = institutionEquipment.isEmpty() ? 0 : institutionEquipment.stream()
                .mapToDouble(eq -> {
                    int hours = institutionBookings.stream()
                            .filter(b -> b.getEquipment().getId().equals(eq.getId()))
                            .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED || b.getBookingStatus() == BookingStatus.COMPLETED)
                            .mapToInt(b -> b.getDurationHours() != null ? b.getDurationHours() : 0)
                            .sum();
                    return Math.min((hours / maxHours) * 100, 100.0);
                })
                .average().orElse(0);
        response.setInstitutionAvgUtilization(Math.round(avgUtil * 10.0) / 10.0);

        Map<String, Long> bookingCountByEquipment = institutionBookings.stream()
                .collect(Collectors.groupingBy(b -> b.getEquipment().getEquipmentName(), Collectors.counting()));

        List<Map<String, Object>> topEquipment = bookingCountByEquipment.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("equipmentName", e.getKey());
                    m.put("bookingCount", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());
        response.setInstitutionTopEquipment(topEquipment);

        long openWorkOrders = workOrderRepository.findAll().stream()
                .filter(w -> equipmentIds.contains(w.getEquipment().getId()))
                .filter(w -> w.getStatus() != WorkOrderStatus.COMPLETED)
                .count();
        response.setInstitutionOpenWorkOrders((int) openWorkOrders);

        return response;
    }

    private AnalyticsResponse buildSystemStats() {
        AnalyticsResponse response = new AnalyticsResponse();
        response.setViewType("SYSTEM");

        response.setSystemTotalInstitutions((int) institutionRepository.count());
        response.setSystemTotalEquipment((int) equipmentRepository.count());
        response.setSystemTotalBookings((int) bookingRepository.count());

        long crossInstitution = bookingRepository.findAll().stream()
                .filter(b -> b.getUser().getInstitution() != null
                        && !b.getUser().getInstitution().getId().equals(b.getEquipment().getInstitution().getId()))
                .count();
        response.setSystemCrossInstitutionBookings((int) crossInstitution);

        return response;
    }
}