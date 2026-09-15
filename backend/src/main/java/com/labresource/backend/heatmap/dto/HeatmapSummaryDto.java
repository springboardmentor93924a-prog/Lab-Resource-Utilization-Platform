package com.labresource.backend.heatmap.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Backend-calculated summary DTO.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapSummaryDto {
    private Integer averageUtilization;
    private Double totalAvailableHours;
    private Double totalUsedHours;
    private Integer idleCount;
}
