package com.example.lab_platform.scheduler;

import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.Maintenance;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.MaintenanceRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class EquipmentStatusScheduler {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final MaintenanceRepository maintenanceRepository;


    public EquipmentStatusScheduler(
            BookingRepository bookingRepository,
            EquipmentRepository equipmentRepository,
            MaintenanceRepository maintenanceRepository) {

        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.maintenanceRepository = maintenanceRepository;
    }


    @Scheduled(fixedRate = 60000) // Runs every 60 seconds
    public void updateEquipmentStatus() {

        LocalDateTime now = LocalDateTime.now();


        // 1. Maintenance has highest priority
        List<Maintenance> maintenanceList =
                maintenanceRepository.findByMaintenanceStatus("Active");


        for (Maintenance maintenance : maintenanceList) {

            Equipment equipment = maintenance.getEquipment();

            if (equipment != null) {

                equipment.setStatus("Under Maintenance");

                equipmentRepository.save(equipment);
            }
        }



        // 2. Update status based on confirmed bookings
        List<Booking> bookings =
                bookingRepository.findByBookingStatus("Confirmed");


        for (Booking booking : bookings) {


            Equipment equipment = booking.getEquipment();


            if (equipment == null) {
                continue;
            }


            // Do not overwrite maintenance status
            if ("Under Maintenance".equalsIgnoreCase(
                    equipment.getStatus())) {

                continue;
            }



            // Before booking start time
            if (now.isBefore(booking.getStartTime())) {

                equipment.setStatus("Booked");

            }

            // Booking currently running
            else if ((now.isEqual(booking.getStartTime())
                    || now.isAfter(booking.getStartTime()))
                    && now.isBefore(booking.getEndTime())) {


                equipment.setStatus("In Use");

            }

            // Booking completed
            else if (now.isAfter(booking.getEndTime())
                    || now.isEqual(booking.getEndTime())) {


                equipment.setStatus("Available");
            }


            equipmentRepository.save(equipment);
        }
    }
}