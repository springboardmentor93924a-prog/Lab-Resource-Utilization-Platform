package com.labresource.backend.maintenance.repository;

import com.labresource.backend.maintenance.entity.TechnicianUnavailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TechnicianUnavailabilityRepository extends JpaRepository<TechnicianUnavailability, Long> {
    List<TechnicianUnavailability> findByTechnicianIdAndStatus(Long technicianId, String status);

    @Query("SELECT tu FROM TechnicianUnavailability tu WHERE tu.technicianId = :technicianId " +
           "AND tu.status = 'ACTIVE' AND tu.startDatetime < :end AND tu.endDatetime > :start")
    List<TechnicianUnavailability> findOverlappingActive(@Param("technicianId") Long technicianId,
                                                          @Param("start") LocalDateTime start,
                                                          @Param("end") LocalDateTime end);
}
