package com.labresource.service;

import com.labresource.dto.HeatmapDataResponseDto;
import com.labresource.dto.UtilizationAnalyticsResponseDto;

import java.util.List;

public interface UtilizationAnalyticsService {

    /*
     * Calculate utilization rate for one equipment.
     */
    UtilizationAnalyticsResponseDto getUtilizationRate(
            String equipmentId
    );

    /*
     * Get idle time details for one equipment.
     */
    UtilizationAnalyticsResponseDto getIdleTime(
            String equipmentId
    );

    /*
     * Get all idle equipments.
     */
    List<UtilizationAnalyticsResponseDto> getIdleEquipments();

    /*
     * Get equipments ordered by highest utilization.
     */
    List<UtilizationAnalyticsResponseDto> getMostUsedEquipments();

    /*
     * Get booking/request demand analysis.
     */
    List<UtilizationAnalyticsResponseDto> getDemandAnalysis();

    /*
     * Heatmap data for one equipment.
     */
    List<HeatmapDataResponseDto> getHeatmapData(
            String equipmentId
    );
}