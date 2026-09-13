package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Booking;
import com.example.demo.repository.BookingRepository;

@RestController
@RequestMapping("/api/cost")
public class CostController {

    @Autowired private BookingRepository bookingRepository;

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        List<Booking> completed = bookingRepository.findAll().stream()
                .filter(b -> "Completed".equals(b.getStatus()) && b.getCost() != null)
                .collect(java.util.stream.Collectors.toList());

        java.math.BigDecimal total = completed.stream()
                .map(Booking::getCost)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        Map<String, java.math.BigDecimal> byDepartment = new java.util.LinkedHashMap<>();
        Map<String, java.math.BigDecimal> byEquipment = new java.util.LinkedHashMap<>();

        for (Booking b : completed) {
            String deptName = (b.getEquipment() != null && b.getEquipment().getDepartment() != null)
                    ? b.getEquipment().getDepartment().getDepartmentName() : "Unassigned";
            String eqName = b.getEquipment() != null ? b.getEquipment().getName() : "Unknown";

            byDepartment.merge(deptName, b.getCost(), java.math.BigDecimal::add);
            byEquipment.merge(eqName, b.getCost(), java.math.BigDecimal::add);
        }

        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("totalCost", total);
        result.put("completedBookings", completed.size());
        result.put("byDepartment", byDepartment);
        result.put("byEquipment", byEquipment);
        return result;
    }

    @GetMapping("/bookings")
    public List<Map<String, Object>> bookingsWithCost() {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getCost() != null)
                .map(b -> {
                    Map<String, Object> m = new java.util.LinkedHashMap<>();
                    m.put("id", b.getBookingId());
                    m.put("equipmentName", b.getEquipment() != null ? b.getEquipment().getName() : null);
                    m.put("departmentName", (b.getEquipment() != null && b.getEquipment().getDepartment() != null)
                            ? b.getEquipment().getDepartment().getDepartmentName() : null);
                    m.put("cost", b.getCost());
                    m.put("status", b.getStatus());
                    return m;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/monthly-report")
    public List<Map<String, Object>> monthlyReport() {
        List<Booking> all = bookingRepository.findAll().stream()
                .filter(b -> b.getBookingStart() != null)
                .collect(java.util.stream.Collectors.toList());

        Map<String, List<Booking>> byMonth = all.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        b -> b.getBookingStart().getYear() + "-" + String.format("%02d", b.getBookingStart().getMonthValue()),
                        java.util.TreeMap::new,
                        java.util.stream.Collectors.toList()
                ));

        List<Map<String, Object>> result = new java.util.ArrayList<>();

        for (Map.Entry<String, List<Booking>> monthEntry : byMonth.entrySet()) {
            List<Booking> monthBookings = monthEntry.getValue();

            java.math.BigDecimal totalCost = monthBookings.stream()
                    .map(b -> b.getCost() != null ? b.getCost() : java.math.BigDecimal.ZERO)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

            long equipmentBookedCount = monthBookings.stream()
                    .map(b -> b.getEquipment() != null ? b.getEquipment().getEquipmentId() : null)
                    .filter(java.util.Objects::nonNull)
                    .distinct()
                    .count();

            Map<Integer, Map<String, Object>> byUser = new java.util.LinkedHashMap<>();
            for (Booking b : monthBookings) {
                if (b.getUser() == null) continue;
                Integer userId = b.getUser().getUserId();
                java.math.BigDecimal cost = b.getCost() != null ? b.getCost() : java.math.BigDecimal.ZERO;
                boolean isPaid = "Completed".equals(b.getStatus());

                Map<String, Object> userEntry = byUser.computeIfAbsent(userId, id -> {
                    Map<String, Object> m = new java.util.LinkedHashMap<>();
                    m.put("userId", id);
                    m.put("userName", b.getUser().getFirstName() + " " + b.getUser().getLastName());
                    m.put("paid", java.math.BigDecimal.ZERO);
                    m.put("pending", java.math.BigDecimal.ZERO);
                    return m;
                });

                if (isPaid) {
                    userEntry.put("paid", ((java.math.BigDecimal) userEntry.get("paid")).add(cost));
                } else {
                    userEntry.put("pending", ((java.math.BigDecimal) userEntry.get("pending")).add(cost));
                }
            }

            Map<String, Object> monthSummary = new java.util.LinkedHashMap<>();
            monthSummary.put("month", monthEntry.getKey());
            monthSummary.put("equipmentBookedCount", equipmentBookedCount);
            monthSummary.put("totalCost", totalCost);
            monthSummary.put("byUser", new java.util.ArrayList<>(byUser.values()));
            result.add(monthSummary);
        }

        return result;
    }
}