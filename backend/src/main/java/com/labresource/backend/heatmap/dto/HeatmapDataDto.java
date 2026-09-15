package com.labresource.backend.heatmap.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Combined response returned by GET /api/heatmap.
 * Contains equipment metadata, usable bookings, pre-calculated cell utilization,
 * and summary statistics authoritatively computed by the backend.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapDataDto {
    private List<HeatmapEquipmentDto> equipment;
    private List<HeatmapBookingDto> bookings;
    private List<HeatmapCellDto> cells;
    private HeatmapSummaryDto summary;

    public HeatmapDataDto(List<HeatmapEquipmentDto> equipment, List<HeatmapBookingDto> bookings) {
        this.equipment = equipment;
        this.bookings = bookings;
        this.cells = List.of();
        this.summary = new HeatmapSummaryDto(0, 0.0, 0.0, 0);
    }
}
