package com.infosys.labresource.Equipment.services;

import com.infosys.labresource.Equipment.dtos.CalibRecordRequestDTO;
import com.infosys.labresource.Equipment.entity.CalibrationRecord;

public interface CalibrationRecordService {
    CalibrationRecord createCalibrationRecord(CalibRecordRequestDTO requestDTO);

    CalibrationRecord getCalibrationRecordByEquipmentId(Long equipmentId);

    CalibrationRecord updateCalibrationRecord(Long calibrationId, CalibRecordRequestDTO requestDTO);

    void deleteCalibrationRecord(Long calibrationId);
}
