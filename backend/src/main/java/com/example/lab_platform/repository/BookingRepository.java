package com.example.lab_platform.repository;

import com.example.lab_platform.entity.Booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository
        extends JpaRepository<Booking, Integer> {
List<Booking> findByUser_UserId(Integer userId);

    List<Booking> findByRecurrenceGroupId(String recurrenceGroupId);
    List<Booking> findByBookingStatus(
            String bookingStatus
    );

    List<Booking> findByEquipment_EquipmentId(
            Integer equipmentId
    );

    @Query("""
        SELECT b
        FROM Booking b
        WHERE b.equipment.equipmentId = :equipmentId
        AND LOWER(b.bookingStatus)
            IN ('pending approval', 'confirmed', 'in use')
        AND b.startTime < :endTime
        AND b.endTime > :startTime
        """)
    List<Booking> findOverlappingBookings(
            @Param("equipmentId")
            Integer equipmentId,

            @Param("startTime")
            LocalDateTime startTime,

            @Param("endTime")
            LocalDateTime endTime
    );

    /*
     * Users with a Pending Approval, Confirmed, or In Use booking on
     * this equipment — the set that gets auto-added to the priority
     * waitlist when an URGENT feedback report comes in against it.
     * Deliberately not time-window-filtered: any live claim on the
     * equipment counts, since the report affects the whole asset,
     * not just one slot. Includes "In Use" (added alongside the
     * Confirmed→In Use transition) so someone actively using the
     * equipment right now still gets displaced/notified, not just
     * someone with a future Confirmed slot.
     */
    @Query("""
        SELECT b
        FROM Booking b
        WHERE b.equipment.equipmentId = :equipmentId
        AND LOWER(b.bookingStatus) IN ('pending approval', 'confirmed', 'in use')
        """)
    List<Booking> findActiveBookingsForEquipment(
            @Param("equipmentId")
            Integer equipmentId
    );

    // Feeds EquipmentStatusScheduler's In-Use activation sweep and
    // BookingServiceImpl.autoCompleteOverdueBookings — a booking can be
    // sitting at either status by the time its end time arrives,
    // depending on whether the 60-second sweep already flipped
    // Confirmed → In Use this cycle.
    List<Booking> findByBookingStatusIn(List<String> bookingStatuses);
}