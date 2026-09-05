package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Booking;
import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.Maintenance;
import com.example.lab_platform.repository.BookingRepository;
import com.example.lab_platform.repository.EquipmentRepository;
import com.example.lab_platform.repository.MaintenanceRepository;
import com.example.lab_platform.service.EquipmentService;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EquipmentServiceImpl
        implements EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceRepository maintenanceRepository;

    public EquipmentServiceImpl(
            EquipmentRepository equipmentRepository,
            BookingRepository bookingRepository,
            MaintenanceRepository maintenanceRepository) {

        this.equipmentRepository =
                equipmentRepository;

        this.bookingRepository =
                bookingRepository;

        this.maintenanceRepository =
                maintenanceRepository;
    }

    @Override
    public List<Equipment> getAllEquipment() {

        List<Equipment> equipmentList =
                equipmentRepository.findAll();

        LocalDateTime now =
                LocalDateTime.now();

        /*
         * IMPORTANT PERFORMANCE FIX (part 2)
         * ===================================
         * calculateStatus() used to be called once per equipment and
         * each call ran its OWN maintenanceRepository/bookingRepository
         * query scoped to just that equipment's id — for N equipment
         * that's 2N extra SELECT queries on every single page load
         * that shows the equipment list (most pages). Fetch both
         * tables ONCE here and group them in memory instead, so the
         * whole list only costs 2 extra queries total, not 2N.
         */
        java.util.Map<Integer, List<Maintenance>> maintenanceByEquipment =
                maintenanceRepository.findAll().stream()
                        .filter(m -> m.getEquipment() != null)
                        .collect(java.util.stream.Collectors.groupingBy(
                                m -> m.getEquipment().getEquipmentId()));

        java.util.Map<Integer, List<Booking>> bookingsByEquipment =
                bookingRepository.findAll().stream()
                        .filter(b -> b.getEquipment() != null)
                        .collect(java.util.stream.Collectors.groupingBy(
                                b -> b.getEquipment().getEquipmentId()));

        for (Equipment equipment : equipmentList) {

            List<Maintenance> maintenanceList = maintenanceByEquipment
                    .getOrDefault(equipment.getEquipmentId(), List.of());
            List<Booking> bookings = bookingsByEquipment
                    .getOrDefault(equipment.getEquipmentId(), List.of());

            // Compute the live display status only — do NOT persist here.
            // See calculateStatus()'s comment below for why.
            equipment.setStatus(calculateStatus(equipment, now, maintenanceList, bookings));
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

        LocalDateTime now = LocalDateTime.now();

        List<Maintenance> maintenanceList =
                maintenanceRepository.findByEquipment_EquipmentId(id);
        List<Booking> bookings =
                bookingRepository.findByEquipment_EquipmentId(id);

        equipment.setStatus(calculateStatus(equipment, now, maintenanceList, bookings));

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

    /*
     * IMPORTANT PERFORMANCE FIX
     * =========================
     * This used to call equipmentRepository.save(equipment) for every
     * single row, on every single GET /api/equipment (and
     * /api/equipment/{id}) call — and calculateStatus() itself queries
     * ALL maintenance records and ALL bookings for that equipment. For
     * N pieces of equipment that's ~2N extra queries plus N writes on
     * every page load that shows the equipment list (which is most
     * pages), which is exactly why pages felt slow.
     *
     * The authoritative persisted status is already kept up to date
     * every 60 seconds by EquipmentStatusScheduler.updateEquipmentStatus()
     * — that's the ONLY place equipment status should be written from a
     * bulk scan. Reads here only need to return an accurate value to
     * the caller (equipment.setStatus(...) on the in-memory object,
     * which is what actually gets serialized in the response) — they
     * don't also need to re-persist it. Worst case the DB's own copy of
     * the status column lags what's shown by up to ~60s, which nothing
     * in this app currently depends on (booking creation/approval
     * re-validates equipment status live from bookings/maintenance
     * anyway, not from the cached status column).
     */
    private String calculateStatus(
            Equipment equipment,
            LocalDateTime now,
            List<Maintenance> maintenanceList,
            List<Booking> bookings) {

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

        /*
         * ==========================================
         * 1. MAINTENANCE
         * ==========================================
         */
        for (Maintenance maintenance :
                maintenanceList) {

            String status =
                    maintenance.getMaintenanceStatus();

            if (status == null) {
                continue;
            }

            if (status.equalsIgnoreCase("Active")
                    || status.equalsIgnoreCase("In Progress")) {

                return "Under Maintenance";
            }
        }

        /*
         * ==========================================
         * 2. BOOKINGS
         * ==========================================
         */
        boolean futureBooking = false;

        for (Booking booking : bookings) {

            String bookingStatus =
                    booking.getBookingStatus();

            // Same fix as EquipmentStatusScheduler.calculateStatus():
            // a booking can now legitimately sit at "In Use" (see
            // EquipmentStatusScheduler.activateInUseBookings()), not
            // just "Confirmed" — this duplicate status-calc path needs
            // to recognize both or it'll disagree with the scheduler
            // and momentarily report equipment as Available/Booked
            // while a booking on it is actively "In Use".
            if (bookingStatus == null
                    || (!bookingStatus.equalsIgnoreCase("Confirmed")
                        && !bookingStatus.equalsIgnoreCase("In Use"))) {

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