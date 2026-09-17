package com.infosys.labresource.EquipmentUtilization.Service;

import com.infosys.labresource.EquipmentUtilization.DTOs.UtilizationAnalyticsDTO;
import com.infosys.labresource.EquipmentUtilization.DTOs.UtilizationResponseDTO;

import java.util.List;

public interface UtilizationService {
UtilizationResponseDTO startUtilization(Long bookingId);
UtilizationResponseDTO endUtilization(Long bookingId);
    // email comes from the authenticated token in the controller, this is what scopes the results
    List<UtilizationResponseDTO> getAllUtilization(String email);
    UtilizationResponseDTO getUtilizationById(Long utilizationId, String email);
    List<UtilizationAnalyticsDTO> getUtilizationAnalytics(String email);
}
