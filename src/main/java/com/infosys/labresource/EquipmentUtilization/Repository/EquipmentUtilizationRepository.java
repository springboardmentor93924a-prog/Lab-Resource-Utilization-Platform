package com.infosys.labresource.EquipmentUtilization.Repository;

import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.EquipmentUtilization.Entity.Utilization;
import com.infosys.labresource.EquipmentUtilization.Entity.UtilizationStatus;
import com.infosys.labresource.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EquipmentUtilizationRepository extends JpaRepository<Utilization,Long> {
    List<Utilization> findByEquipment(Equipment equipment);
    Optional<Utilization> findByBooking(Booking booking);
    List<Utilization> findByStatus(UtilizationStatus status);
    List<Utilization> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
}
