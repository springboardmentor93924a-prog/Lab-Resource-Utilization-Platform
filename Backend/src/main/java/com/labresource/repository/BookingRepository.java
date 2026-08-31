package com.labresource.repository;

import com.labresource.entity.Booking;
import com.labresource.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByEquipmentId(Long equipmentId);

    List<Booking> findByEquipmentIdAndBookingDate(
            Long equipmentId,
            LocalDate bookingDate
    );

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByBookingDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );

    
}