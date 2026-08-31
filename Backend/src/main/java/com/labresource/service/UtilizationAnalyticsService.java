package com.labresource.service;

import java.time.LocalDate;
import java.util.List;

import com.labresource.dto.DemandAnalysisResponse;
import com.labresource.dto.DemandTrendResponse;
import com.labresource.dto.EquipmentRankingResponse;
import com.labresource.dto.UtilizationReportResponse;

public interface UtilizationAnalyticsService {

    /**
     * Calculate utilization percentage for one equipment
     * during the selected date range.
     */
    double calculateEquipmentUtilization(
            Long equipmentId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<DemandAnalysisResponse> getDemandAnalysis(
        LocalDate startDate,
        LocalDate endDate
);

List<DemandTrendResponse> getDemandTrends(
        LocalDate startDate,
        LocalDate endDate
);

List<EquipmentRankingResponse> getEquipmentRanking(
        LocalDate startDate,
        LocalDate endDate
);

UtilizationReportResponse getUtilizationReport(
        LocalDate startDate,
        LocalDate endDate
);
}