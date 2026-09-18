package com.infosys.labresource.booking.Repository;

import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.booking.entity.Booking;
import com.infosys.labresource.booking.entity.BookingStatus;
import com.infosys.labresource.user.entites.Department;
import com.infosys.labresource.user.entites.Institution;
import com.infosys.labresource.user.entites.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {


    boolean existsByEquipmentAndStartTimeLessThanAndEndTimeGreaterThan(
            Equipment equipment,
            LocalDateTime endTime,
            LocalDateTime startTime
    );

    boolean existsByEquipmentAndStatusAndStartTimeLessThanAndEndTimeGreaterThan(
            Equipment equipment,
            BookingStatus status,
            LocalDateTime endTime,
            LocalDateTime startTime
    );

    boolean existsByEquipmentAndStartTimeLessThanAndEndTimeGreaterThanAndBookingIdNot(
            Equipment equipment,
            LocalDateTime endTime,
            LocalDateTime startTime,
            Long bookingId
    );

    List<Booking> findByEquipment(Equipment equipment);
    List<Booking> findByEquipment_Department(Department department);
    List<Booking> findByRequestedBy(UserEntity requestedBy);

    List<Booking> findByEquipment_Institution(Institution institution);
}