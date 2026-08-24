package com.example.lab_platform.service;

import com.example.lab_platform.entity.Equipment;
import com.example.lab_platform.entity.EquipmentDowntime;
import com.example.lab_platform.entity.WorkOrder;

import java.util.List;

public interface EquipmentDowntimeService {

    List<EquipmentDowntime> getAllDowntime();

    List<EquipmentDowntime> getDowntimeForEquipment(Integer equipmentId);

    EquipmentDowntime logDowntime(EquipmentDowntime downtime);

    EquipmentDowntime resolveDowntime(Integer downtimeId);

    // Internal hooks used by WorkOrderService so downtime windows open
    // and close automatically around repair work instead of relying on
    // someone remembering to log it by hand.
    void openDowntimeWindow(Equipment equipment, String reason);

    // Same as above, but also links the window to the work order that
    // triggered it (used whenever a work order is available).
    void openDowntimeWindow(Equipment equipment, WorkOrder workOrder, String reason);

    void closeOpenDowntimeWindow(Equipment equipment);
}
