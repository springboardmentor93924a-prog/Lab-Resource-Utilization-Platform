package com.labresource.backend.maintenance.repository;

import com.labresource.backend.maintenance.entity.TechnicianAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TechnicianAvailabilityRepository extends JpaRepository<TechnicianAvailability, Long> {
    List<TechnicianAvailability> findByTechnicianId(Long technicianId);
    Optional<TechnicianAvailability> findByTechnicianIdAndDayOfWeek(Long technicianId, Integer dayOfWeek);
}
