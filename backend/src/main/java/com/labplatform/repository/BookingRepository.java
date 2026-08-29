package com.labplatform.repository;

import com.labplatform.entity.Booking;
import com.labplatform.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("SELECT b FROM Booking b WHERE b.equipment.id = :equipmentId AND b.status IN ('CONFIRMED', 'IN_USE') AND (:startTime < b.endTime AND :endTime > b.startTime)")
    List<Booking> findConflictingBookings(@Param("equipmentId") Long equipmentId, @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    List<Booking> findByStatus(BookingStatus status);
}