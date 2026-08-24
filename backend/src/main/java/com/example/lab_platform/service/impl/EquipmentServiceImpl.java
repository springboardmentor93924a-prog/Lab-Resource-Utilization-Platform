package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.WorkOrder;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.WorkOrderRepository;
import com.example.lab_platform.service.EquipmentService;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EquipmentServiceImpl
        implements EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final WorkOrderRepository workOrderRepository;

    public EquipmentServiceImpl(
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            WorkOrderRepository workOrderRepository) {

        this.equipmentRepository =
                equipmentRepository;

        this.bookingRepository =
                bookingRepository;

        this.workOrderRepository =
                workOrderRepository;
    }

    @Override
    public List<Equipment> getAllEquipment() {

        List<Equipment> equipmentList =
                equipmentRepository.findAll();

        LocalDateTime now =
                LocalDateTime.now();

        for (Equipment equipment : equipmentList) {

            updateCurrentStatus(
                    equipment,
                    now
            );
        }

        return equipmentList;
    }

    @Override
    public Equipment getEquipmentById(Integer id) {

        Equipment equipment =
                equipmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Equipment not found"
                                )
                        );

        updateCurrentStatus(
                equipment,
                LocalDateTime.now()
        );

        return equipment;
    }

    @Override
    public Equipment updateStatus(
            Integer id,
            String status) {

        Equipment equipment =
                equipmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Equipment not found"
                                )
                        );

        equipment.setStatus(status);

        return equipmentRepository.save(
                equipment
        );
    }

    private void updateCurrentStatus(
            Equipment equipment,
            LocalDateTime now) {

        String calculatedStatus =
                calculateStatus(
                        equipment,
                        now
                );

        equipment.setStatus(calculatedStatus);

        /*
         * Save so that the database also contains
         * the latest status.
         */
        equipmentRepository.save(equipment);
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
         * automatically changed to Available/Booked/
         * In Use by the scheduler or status calculation.
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
         * ==========================================
         * 1. WORK ORDERS (MAINTENANCE)
         * Any work order not yet completed/cancelled
         * keeps the equipment Under Maintenance.
         * ==========================================
         */
        List<WorkOrder> workOrders =
                workOrderRepository
                        .findByEquipment_EquipmentId(
                                equipmentId
                        );

        for (WorkOrder workOrder : workOrders) {

            String status = workOrder.getWorkOrderStatus();

            boolean closed =
                    status != null
                            && (status.equalsIgnoreCase("Completed")
                            || status.equalsIgnoreCase("Cancelled"));

            if (!closed) {
                return "Under Maintenance";
            }
        }

        /*
         * ==========================================
         * 2. BOOKINGS
         * ==========================================
         */
        List<Booking> bookings =
                bookingRepository
                        .findByEquipment_EquipmentId(
                                equipmentId
                        );

        boolean futureBooking = false;

        for (Booking booking : bookings) {

            String bookingStatus =
                    booking.getBookingStatus();

            if (bookingStatus == null
                    || !bookingStatus.equalsIgnoreCase(
                            "Confirmed")) {

                continue;
            }

            LocalDateTime start =
                    booking.getStartTime();

            LocalDateTime end =
                    booking.getEndTime();

            if (start == null || end == null) {
                continue;
            }

            /*
             * Currently being used.
             */
            if (!now.isBefore(start)
                    && now.isBefore(end)) {

                return "In Use";
            }

            /*
             * Future reservation.
             */
            if (now.isBefore(start)) {

                futureBooking = true;
            }
        }

        if (futureBooking) {
            return "Booked";
        }

        /*
         * ==========================================
         * 3. AVAILABLE
         * ==========================================
         */
        return "Available";
    }
}