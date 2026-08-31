
package com.labresource.repository;

import com.labresource.entity.ExternalBooking;
import com.labresource.entity.ExternalBookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ExternalBookingRepository
        extends JpaRepository<ExternalBooking, Long> {

    List<ExternalBooking> findByExternalEmailOrderByCreatedAtDesc(
            String externalEmail
    );

    List<ExternalBooking> findAllByOrderByCreatedAtDesc();

    List<ExternalBooking> findByStatusOrderByCreatedAtDesc(
            ExternalBookingStatus status
    );

    List<ExternalBooking> findByEquipmentIdAndBookingDate(
            Long equipmentId,
            LocalDate bookingDate
    );

    List<ExternalBooking> findByEquipmentIdAndBookingDateAndStatus(
            Long equipmentId,
            LocalDate bookingDate,
            ExternalBookingStatus status
    );
}
