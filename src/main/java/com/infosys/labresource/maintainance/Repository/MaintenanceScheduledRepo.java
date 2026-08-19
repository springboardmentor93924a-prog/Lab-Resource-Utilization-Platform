package com.infosys.labresource.maintainance.Repository;

import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.maintainance.Entities.MaintenanceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MaintenanceScheduledRepo extends JpaRepository<MaintenanceSchedule,Long> {

    List<MaintenanceSchedule> findByEquipmentOrderByScheduledStartAsc(Equipment equipment);

    boolean existsByEquipmentAndScheduledStartLessThanAndScheduledEndGreaterThan(Equipment equipment,
                                                                                 LocalDateTime endTime, LocalDateTime startTime
    );
}
