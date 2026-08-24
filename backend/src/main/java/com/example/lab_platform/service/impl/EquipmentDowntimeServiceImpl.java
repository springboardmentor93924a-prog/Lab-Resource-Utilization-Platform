package com.example.lab_platform.service.impl;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.EquipmentDowntime;
import com.example.lab_platform.entity.WorkOrder;
import com.example.lab_platform.repository.EquipmentDowntimeRepository;
import com.example.lab_platform.service.EquipmentDowntimeService;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EquipmentDowntimeServiceImpl implements EquipmentDowntimeService {

    private final EquipmentDowntimeRepository equipmentDowntimeRepository;

    public EquipmentDowntimeServiceImpl(EquipmentDowntimeRepository equipmentDowntimeRepository) {
        this.equipmentDowntimeRepository = equipmentDowntimeRepository;
    }

    @Override
    public List<EquipmentDowntime> getAllDowntime() {
        return equipmentDowntimeRepository.findAll();
    }

    @Override
    public List<EquipmentDowntime> getDowntimeForEquipment(Integer equipmentId) {
        return equipmentDowntimeRepository
                .findByEquipment_EquipmentIdOrderByStartDateDesc(equipmentId);
    }

    @Override
    public EquipmentDowntime logDowntime(EquipmentDowntime downtime) {
        if (downtime.getStartDate() == null) {
            downtime.setStartDate(LocalDateTime.now());
        }
        if (downtime.getDowntimeStatus() == null || downtime.getDowntimeStatus().isBlank()) {
            downtime.setDowntimeStatus(downtime.getEndDate() != null ? "RESOLVED" : "ONGOING");
        }
        return equipmentDowntimeRepository.save(downtime);
    }

    @Override
    public EquipmentDowntime resolveDowntime(Integer downtimeId) {
        EquipmentDowntime downtime = equipmentDowntimeRepository.findById(downtimeId)
                .orElseThrow(() -> new RuntimeException("Downtime record not found: " + downtimeId));

        downtime.setEndDate(LocalDateTime.now());
        downtime.setDowntimeStatus("RESOLVED");

        return equipmentDowntimeRepository.save(downtime);
    }

    @Override
    public void openDowntimeWindow(Equipment equipment, String reason) {
        openDowntimeWindow(equipment, null, reason);
    }

    @Override
    public void openDowntimeWindow(Equipment equipment, WorkOrder workOrder, String reason) {
        if (equipment == null) {
            return;
        }

        // Don't stack a second open window on top of one that's already
        // running for the same equipment (e.g. a second work order raised
        // while the first repair is still in progress).
        boolean alreadyOpen = equipmentDowntimeRepository
                .findFirstByEquipment_EquipmentIdAndDowntimeStatusOrderByStartDateDesc(
                        equipment.getEquipmentId(), "ONGOING")
                .isPresent();

        if (alreadyOpen) {
            return;
        }

        EquipmentDowntime downtime = new EquipmentDowntime();
        downtime.setEquipment(equipment);
        downtime.setWorkOrder(workOrder);
        downtime.setStartDate(LocalDateTime.now());
        downtime.setReason(reason);
        downtime.setDowntimeStatus("ONGOING");

        equipmentDowntimeRepository.save(downtime);
    }

    @Override
    public void closeOpenDowntimeWindow(Equipment equipment) {
        if (equipment == null) {
            return;
        }

        Optional<EquipmentDowntime> open = equipmentDowntimeRepository
                .findFirstByEquipment_EquipmentIdAndDowntimeStatusOrderByStartDateDesc(
                        equipment.getEquipmentId(), "ONGOING");

        if (open.isEmpty()) {
            return;
        }

        EquipmentDowntime downtime = open.get();
        downtime.setEndDate(LocalDateTime.now());
        downtime.setDowntimeStatus("RESOLVED");

        equipmentDowntimeRepository.save(downtime);
    }
}
