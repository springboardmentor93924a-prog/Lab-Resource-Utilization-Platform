package com.example.lab_platform.service;

import com.example.lab_platform.entity.Maintenance;

import java.util.List;

public interface MaintenanceService {

    List<Maintenance> getAllMaintenance();

    Maintenance getMaintenanceById(Integer id);

    List<Maintenance> getMaintenanceForEquipment(Integer equipmentId);

    // Preventive-maintenance items due today or earlier and not yet
    // completed — for a "due / overdue maintenance" dashboard widget.
    List<Maintenance> getUpcomingMaintenance();

    Maintenance scheduleMaintenance(Maintenance maintenance);

    Maintenance updateMaintenance(Integer id, Maintenance updatedMaintenance);
}
