package com.labresource.repository;

import com.labresource.entity.Booking;
import com.labresource.entity.Equipment;
import com.labresource.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {

    List<Booking> findByUser(User user);

    List<Booking> findByEquipment(Equipment equipment);

    List<Booking> findByBookingStatus(String bookingStatus);

    List<Booking> findByApprovalStatus(String approvalStatus);

    List<Booking> findByStartTimeBetween(
            LocalDateTime start,
            LocalDateTime end
    );

    List<Booking> findByEquipmentAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
            Equipment equipment,
            LocalDateTime endTime,
            LocalDateTime startTime
    );
}