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
            IN ('pending approval', 'confirmed')
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
     * Users with a Pending Approval or Confirmed booking on this
     * equipment — the set that gets auto-added to the priority
     * waitlist when an URGENT feedback report comes in against it.
     * Deliberately not time-window-filtered: any live claim on the
     * equipment counts, since the report affects the whole asset,
     * not just one slot.
     */
    @Query("""
        SELECT b
        FROM Booking b
        WHERE b.equipment.equipmentId = :equipmentId
        AND LOWER(b.bookingStatus) IN ('pending approval', 'confirmed')
        """)
    List<Booking> findActiveBookingsForEquipment(
            @Param("equipmentId")
            Integer equipmentId
    );
}