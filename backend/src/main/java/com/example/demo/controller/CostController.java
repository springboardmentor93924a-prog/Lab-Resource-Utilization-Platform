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
}
