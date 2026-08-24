package com.example.lab_platform.service;

import com.example.lab_platform.entity.MaintenanceServiceLog;

import java.util.List;

public interface MaintenanceServiceLogService {

    List<MaintenanceServiceLog> getLogsForWorkOrder(Integer workOrderId);

    List<MaintenanceServiceLog> getHistoryForEquipment(Integer equipmentId);

    MaintenanceServiceLog addLog(Integer workOrderId, MaintenanceServiceLog log);
}
