package com.labplatform.repository;

import com.labplatform.entity.Booking;
import com.labplatform.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByEquipmentId(Long equipmentId);
    List<Booking> findByRequestedById(Long userId);
    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByEquipmentIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            Long equipmentId, List<BookingStatus> statuses, LocalDateTime end, LocalDateTime start);

    List<Booking> findByEquipmentIdAndStartTimeBetween(Long equipmentId, LocalDateTime from, LocalDateTime to);
}
