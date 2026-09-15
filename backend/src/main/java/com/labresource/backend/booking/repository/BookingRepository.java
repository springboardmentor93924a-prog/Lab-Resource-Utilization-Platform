package com.labresource.backend.booking.repository;

import com.labresource.backend.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdAndStatusInOrderByStartTimeAsc(Long userId, List<String> statuses);

    List<Booking> findByUserIdAndStatusInOrderByStartTimeDesc(Long userId, List<String> statuses);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, String status);

    List<Booking> findByEquipmentIdInAndStatus(List<Long> equipmentIds, String status);

    long countByEquipmentIdInAndStatus(List<Long> equipmentIds, String status);

    @Query("SELECT b FROM Booking b WHERE b.equipmentId = :equipmentId " +
           "AND b.status IN ('PENDING_APPROVAL','CONFIRMED','IN_USE') " +
           "AND b.startTime < :end AND b.endTime > :start " +
           "AND (:excludeBookingId IS NULL OR b.bookingId <> :excludeBookingId)")
    List<Booking> findOverlapping(@Param("equipmentId") Long equipmentId,
                                   @Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end,
                                   @Param("excludeBookingId") Long excludeBookingId);

    List<Booking> findByEquipmentIdInAndStartTimeBetween(List<Long> equipmentIds, LocalDateTime start, LocalDateTime end);

    @Query("SELECT b FROM Booking b WHERE b.equipmentId IN :equipmentIds " +
           "AND b.startTime < :end AND b.endTime > :start")
    List<Booking> findByEquipmentIdInAndOverlapping(
            @Param("equipmentIds") List<Long> equipmentIds,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    List<Booking> findByEquipmentIdIn(List<Long> equipmentIds);

    @Query("SELECT b FROM Booking b WHERE b.equipmentId IN " +
           "(SELECT e.equipmentId FROM Equipment e WHERE e.departmentId = :departmentId) " +
           "ORDER BY b.startTime DESC")
    List<Booking> findByDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT b FROM Booking b WHERE b.equipmentId IN " +
           "(SELECT e.equipmentId FROM Equipment e WHERE e.departmentId = :departmentId) " +
           "AND (:status IS NULL OR b.status = :status) " +
           "ORDER BY b.startTime DESC")
    List<Booking> findByDepartmentIdAndStatus(@Param("departmentId") Long departmentId, @Param("status") String status);

    @Query("SELECT b FROM Booking b WHERE b.equipmentId IN " +
           "(SELECT e.equipmentId FROM Equipment e WHERE e.institutionId = :institutionId) " +
           "ORDER BY b.startTime DESC")
    List<Booking> findByInstitutionId(@Param("institutionId") Long institutionId);

    @Query("SELECT b FROM Booking b WHERE b.userId = :userId " +
           "AND b.status = 'IN_USE' " +
           "AND b.startTime <= :now AND b.endTime > :now " +
           "ORDER BY b.startTime ASC")
    List<Booking> findActiveInUseBookingsForUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}


