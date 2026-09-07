package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Booking;
import com.example.demo.entity.Equipment;
import com.example.demo.entity.Maintenance;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.EquipmentRepository;
import com.example.demo.repository.MaintenanceRepository;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired private EquipmentRepository equipmentRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private MaintenanceRepository maintenanceRepository;

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        List<Equipment> equipment = equipmentRepository.findAll();
        List<Booking> bookings = bookingRepository.findAll();
        List<Maintenance> workOrders = maintenanceRepository.findAll();

        Map<String, Long> equipmentByStatus = equipment.stream()
                .collect(java.util.stream.Collectors.groupingBy(Equipment::getStatus, java.util.stream.Collectors.counting()));

        Map<String, Long> bookingsByStatus = bookings.stream()
                .collect(java.util.stream.Collectors.groupingBy(Booking::getStatus, java.util.stream.Collectors.counting()));

        Map<String, Long> workOrdersByStatus = workOrders.stream()
                .collect(java.util.stream.Collectors.groupingBy(Maintenance::getStatus, java.util.stream.Collectors.counting()));

        java.math.BigDecimal totalCost = bookings.stream()
                .filter(b -> b.getCost() != null)
                .map(Booking::getCost)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        long sharedEquipmentCount = equipment.stream()
                .filter(e -> Boolean.TRUE.equals(e.getSharedAvailable()))
                .count();

        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("totalEquipment", equipment.size());
        result.put("equipmentByStatus", equipmentByStatus);
        result.put("sharedEquipmentCount", sharedEquipmentCount);
        result.put("totalBookings", bookings.size());
        result.put("bookingsByStatus", bookingsByStatus);
        result.put("totalWorkOrders", workOrders.size());
        result.put("workOrdersByStatus", workOrdersByStatus);
        result.put("totalCost", totalCost);
        return result;
    }
}
