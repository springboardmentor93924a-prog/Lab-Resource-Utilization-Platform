package com.labresource.service;

import com.labresource.dto.EquipmentDowntimeResponseDto;
import java.util.List;

public interface EquipmentDowntimeAnalyticsService {
    List<EquipmentDowntimeResponseDto> getEquipmentDowntime();
}
