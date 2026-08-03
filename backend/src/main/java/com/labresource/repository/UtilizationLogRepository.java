package com.labresource.repository;

import com.labresource.entity.Booking;
import com.labresource.entity.Equipment;
import com.labresource.entity.User;
import com.labresource.entity.UtilizationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UtilizationLogRepository
        extends JpaRepository<UtilizationLog, String> {

    List<UtilizationLog> findByEquipment(
            Equipment equipment
    );

    List<UtilizationLog> findByUser(
            User user
    );

    List<UtilizationLog> findByBooking(
            Booking booking
    );

    List<UtilizationLog> findByStatusIgnoreCase(
            String status
    );

    List<UtilizationLog> findByEquipmentAndStatusIgnoreCase(
            Equipment equipment,
            String status
    );

    Optional<UtilizationLog> findFirstByEquipmentAndStatusIgnoreCaseOrderByStartTimeDesc(
            Equipment equipment,
            String status
    );

    List<UtilizationLog> findByStartTimeBetween(
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    List<UtilizationLog> findByEquipmentAndStartTimeBetween(
            Equipment equipment,
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    List<UtilizationLog> findByUsageDurationMinutesGreaterThanEqual(
            Integer minutes
    );

    List<UtilizationLog> findByUtilizationSourceIgnoreCase(
            String utilizationSource
    );
}