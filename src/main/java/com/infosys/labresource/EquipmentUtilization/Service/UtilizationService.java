package com.infosys.labresource.EquipmentUtilization.Service;

import com.infosys.labresource.EquipmentUtilization.DTOs.UtilizationAnalyticsDTO;
import com.infosys.labresource.EquipmentUtilization.DTOs.UtilizationResponseDTO;

import java.util.List;

public interface UtilizationService {
UtilizationResponseDTO startUtilization(Long bookingId);
UtilizationResponseDTO endUtilization(Long bookingId);
    List<UtilizationResponseDTO> getAllUtilization();
UtilizationResponseDTO getUtilizationById(Long utilizationId);
    List<UtilizationAnalyticsDTO> getUtilizationAnalytics();
}
