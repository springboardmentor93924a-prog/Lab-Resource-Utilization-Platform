package com.infosys.labresource.booking.Repository;

import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface BookingRepository extends JpaRepository<Booking,Long> {
    boolean existsByEquipmentAndStartTimeLessThanAndEndTimeGreaterThan(
            Equipment equipment,
            LocalDateTime endTime,
            LocalDateTime startTime
    );

    boolean existsByEquipmentAndStartTimeLessThanAndEndTimeGreaterThanAndBookingIdNot(
            Equipment equipment,
            LocalDateTime endTime,
            LocalDateTime startTime,
            Long bookingId
    );
}
