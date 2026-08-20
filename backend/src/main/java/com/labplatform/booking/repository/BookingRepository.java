package com.labplatform.booking.repository;

import com.labplatform.booking.model.Booking;
import com.labplatform.booking.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(UUID userId);

    List<Booking> findByEquipmentId(Long equipmentId);

    List<Booking> findByEquipmentIdAndBookingDateAndBookingStatusIn(
            Long equipmentId,
            LocalDate bookingDate,
            List<BookingStatus> statuses
    );

    // Department / Resource usage report
    List<Booking> findByBookingDateBetween(
            LocalDate from,
            LocalDate to
    );
}