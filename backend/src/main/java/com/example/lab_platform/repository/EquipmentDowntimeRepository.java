package com.example.lab_platform.repository;

import com.example.lab_platform.entity.EquipmentDowntime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentDowntimeRepository extends JpaRepository<EquipmentDowntime, Integer> {

    List<EquipmentDowntime> findByEquipment_EquipmentIdOrderByStartDateDesc(Integer equipmentId);

    // The currently-open downtime window for a piece of equipment, if
    // any — used to close it out (set endDate) when maintenance work
    // finishes.
    Optional<EquipmentDowntime> findFirstByEquipment_EquipmentIdAndDowntimeStatusOrderByStartDateDesc(
            Integer equipmentId, String downtimeStatus
    );

    List<EquipmentDowntime> findByDowntimeStatus(String downtimeStatus);
}
