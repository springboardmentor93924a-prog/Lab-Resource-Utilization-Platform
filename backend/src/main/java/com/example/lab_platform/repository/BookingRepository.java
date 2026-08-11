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
            IN ('pending', 'confirmed')
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
}