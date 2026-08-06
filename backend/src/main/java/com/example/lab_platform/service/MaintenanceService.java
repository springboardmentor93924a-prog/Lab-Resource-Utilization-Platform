package com.example.lab_platform.service;

import com.example.lab_platform.entity.Maintenance;

import java.util.List;

public interface MaintenanceService {

    List<Maintenance> getAllMaintenance();

    Maintenance createMaintenance(Maintenance maintenance);

    Maintenance getMaintenanceById(Long id);

}