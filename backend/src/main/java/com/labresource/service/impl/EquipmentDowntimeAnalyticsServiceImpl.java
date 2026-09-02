package com.labresource.service.impl;

import com.labresource.dto.EquipmentDowntimeResponseDto;
import com.labresource.entity.MaintenanceRecord;
import com.labresource.repository.MaintenanceRecordRepository;
import com.labresource.service.EquipmentDowntimeAnalyticsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class EquipmentDowntimeAnalyticsServiceImpl
        implements EquipmentDowntimeAnalyticsService {

    private final MaintenanceRecordRepository maintenanceRecordRepository;

    public EquipmentDowntimeAnalyticsServiceImpl(
            MaintenanceRecordRepository maintenanceRecordRepository
    ) {
        this.maintenanceRecordRepository = maintenanceRecordRepository;
    }

    @Override
    public List<EquipmentDowntimeResponseDto> getEquipmentDowntime() {
        Map<String, EquipmentDowntimeResponseDto> result = new LinkedHashMap<>();

        for (MaintenanceRecord record : maintenanceRecordRepository.findAll()) {
            if (record.getEquipment() == null) continue;

            String equipmentId = record.getEquipment().getId();

            EquipmentDowntimeResponseDto dto = result.computeIfAbsent(
                    equipmentId,
                    key -> {
                        EquipmentDowntimeResponseDto created = new EquipmentDowntimeResponseDto();
                        created.setEquipmentId(equipmentId);
                        created.setEquipmentName(record.getEquipment().getName());
                        return created;
                    });

            dto.setMaintenanceRecordCount(dto.getMaintenanceRecordCount() + 1);

            if (record.getScheduledDate() != null
                    && record.getCompletionDate() != null
                    && record.getCompletionDate().isAfter(record.getScheduledDate())) {

                long minutes = Duration.between(
                        record.getScheduledDate(),
                        record.getCompletionDate()
                ).toMinutes();

                dto.setTotalDowntimeMinutes(
                        dto.getTotalDowntimeMinutes() + minutes
                );
            }
        }

        return result.values().stream().toList();
    }
}
