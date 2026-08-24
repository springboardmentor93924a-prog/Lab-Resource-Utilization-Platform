package com.example.lab_platform.scheduler;

import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.WorkOrder;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.WorkOrderRepository;
import com.example.lab_platform.service.BookingService;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class EquipmentStatusScheduler {

    private static final List<String> CLOSED_WORK_ORDER_STATUSES = List.of("completed", "cancelled");

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final WorkOrderRepository workOrderRepository;
    private final BookingService bookingService;

    public EquipmentStatusScheduler(
            BookingRepository bookingRepository,
            EquipmentRepository equipmentRepository,
            WorkOrderRepository workOrderRepository,
            BookingService bookingService) {

        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.workOrderRepository = workOrderRepository;
        this.bookingService = bookingService;
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

        // Confirmed bookings whose endTime has already passed get
        // auto-completed here — otherwise they sit at "Confirmed"
        // forever with no path to "Completed" except a manual click.
        bookingService.autoCompleteOverdueBookings();

        List<Equipment> equipmentList =
                equipmentRepository.findAll();

        for (Equipment equipment : equipmentList) {

            String newStatus =
                    calculateStatus(
                            equipment,
                            now
                    );

            if (!newStatus.equalsIgnoreCase(
                    equipment.getStatus())) {

                equipment.setStatus(newStatus);

                equipmentRepository.save(equipment);
            }
        }
    }

    private boolean isClosedWorkOrderStatus(String status) {
        return status != null && CLOSED_WORK_ORDER_STATUSES.contains(status.toLowerCase());
    }

    private String calculateStatus(
            Equipment equipment,
            LocalDateTime now) {

        /*
         * ==========================================
         * 0. MANUAL / PERMANENT STATUS
         * ==========================================
         *
         * Out of Service and Retired should not be
         * automatically changed to another status.
         */
        String existingStatus =
                equipment.getStatus();

        if (existingStatus != null
                && (existingStatus.equalsIgnoreCase("Out of Service")
                || existingStatus.equalsIgnoreCase("Retired"))) {

            return existingStatus;
        }

        Integer equipmentId =
                equipment.getEquipmentId();

        /*
         * ------------------------------------------------
         * 1. WORK ORDERS HAVE HIGHEST PRIORITY
         * Any work order that hasn't been completed or
         * cancelled keeps the equipment "Under Maintenance"
         * regardless of bookings.
         * ------------------------------------------------
         */
        List<WorkOrder> workOrders =
                workOrderRepository
                        .findByEquipment_EquipmentId(
                                equipmentId
                        );

        for (WorkOrder workOrder : workOrders) {

            if (!isClosedWorkOrderStatus(workOrder.getWorkOrderStatus())) {

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
            if (!bookingStatus.equalsIgnoreCase(
                    "Confirmed")) {

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
         * 3. NO OPEN WORK ORDER / NO ACTIVE BOOKING
         * ------------------------------------------------
         */
        return "Available";
    }
}
