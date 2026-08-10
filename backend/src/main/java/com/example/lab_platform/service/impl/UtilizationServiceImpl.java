 package com.example.lab_platform.service.impl;

import com.example.lab_platform.dto.UtilizationDTO;
import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.service.UtilizationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class UtilizationServiceImpl extends UtilizationService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Override
    public List<UtilizationDTO> getUtilizationData() {

        List<Equipment> equipments = equipmentRepository.findAll();
        List<Booking> bookings = bookingRepository.findAll();

        List<UtilizationDTO> result = new ArrayList<>();

        for (Equipment equipment : equipments) {

            double usedHours = 0;
            LocalDate latestUsedDate = null;

            for (Booking booking : bookings) {

                if (booking.getEquipment() == null) continue;

                if (!booking.getEquipment().getEquipmentId()
                        .equals(equipment.getEquipmentId())) continue;

                String status = booking.getBookingStatus();
                if (status == null) continue;

                status = status.toLowerCase();

                // ✅ valid bookings
                if (!(status.equals("completed") || status.equals("confirmed"))) continue;

                if (booking.getStartTime() == null ||
                    booking.getEndTime() == null) continue;

                // ✅ used hours
                long hours = Duration.between(
                        booking.getStartTime(),
                        booking.getEndTime()
                ).toHours();

                usedHours += hours;

                // ✅ latest used date
                LocalDate bookingDate = booking.getStartTime().toLocalDate();
                if (latestUsedDate == null || bookingDate.isAfter(latestUsedDate)) {
                    latestUsedDate = bookingDate;
                }
            }

            double totalHours = 24;
            double idleHours = totalHours - usedHours;
            if (idleHours < 0) idleHours = 0;

            double utilizationPercent = (usedHours / totalHours) * 100;

            // ✅ Idle Days (MAIN FEATURE)
            long idleDays = 0;
            if (latestUsedDate != null) {
                idleDays = ChronoUnit.DAYS.between(
                        latestUsedDate,
                        LocalDate.now()
                );
            }

            // ✅ Category
            String category;
            if (utilizationPercent < 30) category = "LOW";
            else if (utilizationPercent < 70) category = "MEDIUM";
            else category = "HIGH";

            UtilizationDTO dto = new UtilizationDTO();
            dto.setEquipmentName(equipment.getEquipmentName());
            dto.setUsedHours(usedHours);
            dto.setIdleHours(idleHours);
            dto.setUtilizationPercentage(utilizationPercent);
            dto.setCategory(category);
            dto.setIdleDays(idleDays);

            result.add(dto);
        }

        return result;
    }
}