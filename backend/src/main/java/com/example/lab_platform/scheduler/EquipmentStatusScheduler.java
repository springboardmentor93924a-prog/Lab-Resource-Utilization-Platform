package com.example.lab_platform.scheduler;

import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.Maintenance;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.MaintenanceRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
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

    /*
     * Run immediately after application startup,
     * then every 60 seconds.
     */
    @Scheduled(
            initialDelay = 1000,
            fixedRate = 60000
    )
    public void updateEquipmentStatus() {

        LocalDateTime now = LocalDateTime.now();

        activateDueMaintenance();

        List<Equipment> equipmentList =
                equipmentRepository.findAll();

        for (Equipment equipment : equipmentList) {

            String newStatus =
                    calculateStatus(equipment, now);

            if (!newStatus.equalsIgnoreCase(
                    equipment.getStatus())) {

                equipment.setStatus(newStatus);

                equipmentRepository.save(equipment);
            }
        }
    }

    /*
     * Auto-transition: any maintenance record still marked
     * "Scheduled" whose maintenanceDate has arrived (today
     * or already passed) is flipped to "Active", so the
     * equipment correctly shows Under Maintenance starting
     * on the scheduled day.
     */
    private void activateDueMaintenance() {

        LocalDate today = LocalDate.now();

        List<Maintenance> scheduledMaintenance =
                maintenanceRepository.findByMaintenanceStatus("Scheduled");

        for (Maintenance maintenance : scheduledMaintenance) {

            LocalDate maintenanceDate = maintenance.getMaintenanceDate();

            if (maintenanceDate == null) {
                continue;
            }

            if (!maintenanceDate.isAfter(today)) {

                maintenance.setMaintenanceStatus("Active");

                maintenanceRepository.save(maintenance);
            }
        }
    }
    
    private String calculateStatus(
            Equipment equipment,
            LocalDateTime now) {

        Integer equipmentId =
                equipment.getEquipmentId();

        /*
         * ------------------------------------------------
         * 1. MAINTENANCE HAS HIGHEST PRIORITY
         * ------------------------------------------------
         */
        List<Maintenance> maintenanceList =
                maintenanceRepository
                        .findByEquipment_EquipmentId(
                                equipmentId
                        );

        for (Maintenance maintenance : maintenanceList) {

            String maintenanceStatus =
                    maintenance.getMaintenanceStatus();

            if (maintenanceStatus == null) {
                continue;
            }

            /*
             * Accept both statuses currently used
             * in the project/database.
             */
            if (maintenanceStatus.equalsIgnoreCase("Active")
                    || maintenanceStatus.equalsIgnoreCase("In Progress")) {

                return "Under Maintenance";
            }
        }

        /*
         * ------------------------------------------------
         * 2. CHECK CONFIRMED BOOKINGS
         * ------------------------------------------------
         */
        List<Booking> bookings =
                bookingRepository
                        .findByEquipment_EquipmentId(
                                equipmentId
                        );

        boolean futureBooking = false;

        for (Booking booking : bookings) {

            if (booking.getStartTime() == null
                    || booking.getEndTime() == null) {
                continue;
            }

            String bookingStatus =
                    booking.getBookingStatus();

            if (bookingStatus == null) {
                continue;
            }

            /*
             * Only confirmed bookings affect
             * equipment availability.
             */
            if (!bookingStatus.equalsIgnoreCase("Confirmed")) {
                continue;
            }

            LocalDateTime start =
                    booking.getStartTime();

            LocalDateTime end =
                    booking.getEndTime();

            /*
             * ------------------------------------------------
             * CURRENT BOOKING → IN USE
             * ------------------------------------------------
             */
            if (!now.isBefore(start)
                    && now.isBefore(end)) {

                return "In Use";
            }

            /*
             * ------------------------------------------------
             * FUTURE BOOKING → BOOKED
             * ------------------------------------------------
             */
            if (now.isBefore(start)) {

                futureBooking = true;
            }
        }

        if (futureBooking) {
            return "Booked";
        }

        /*
         * ------------------------------------------------
         * 3. NO MAINTENANCE / NO ACTIVE BOOKING
         * ------------------------------------------------
         */
        return "Available";
    }
}