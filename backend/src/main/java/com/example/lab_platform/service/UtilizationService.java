 package com.example.lab_platform.service;

import com.example.lab_platform.dto.UtilizationDTO;
import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class UtilizationService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public List<UtilizationDTO> getUtilizationData() {

        List<Equipment> equipments = equipmentRepository.findAll();
        List<Booking> bookings = bookingRepository.findAll();

        List<UtilizationDTO> result = new ArrayList<>();

        for (Equipment equipment : equipments) {

            double usedHours = 0;

            for (Booking booking : bookings) {

                // ✅ FIXED LINE (equipmentId match)
                if (booking.getEquipment() != null &&
                    booking.getEquipment().getEquipmentId().equals(equipment.getEquipmentId())) {

                    if (booking.getStartTime() != null && booking.getEndTime() != null) {

                        Duration duration = Duration.between(
                                booking.getStartTime(),
                                booking.getEndTime()
                        );

                        usedHours += duration.toHours();
                    }
                }
            }

            double totalHours = 24;
            double idleHours = totalHours - usedHours;
            double utilization = (usedHours / totalHours) * 100;

            String category;
            if (utilization > 70) {
                category = "HIGH";
            } else if (utilization >= 30) {
                category = "MEDIUM";
            } else {
                category = "LOW";
            }

            // ✅ FIXED LINE (equipmentName)
            result.add(new UtilizationDTO(
                    equipment.getEquipmentName(),
                    usedHours,
                    idleHours,
                    utilization,
                    category
            ));
        }

        return result;
    }
}