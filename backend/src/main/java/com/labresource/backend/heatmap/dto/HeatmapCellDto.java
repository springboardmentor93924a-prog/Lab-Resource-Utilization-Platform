package com.labresource.backend.heatmap.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Backend-calculated utilization cell DTO.
 * Represents authoritative utilization for a specific equipment and time column.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapCellDto {
    private Long equipmentId;
    private String colKey;
    private Double availableHours;
    private Double usedHours;
    private Integer utilizationPercentage;
    private List<Long> bookingIds;
}
