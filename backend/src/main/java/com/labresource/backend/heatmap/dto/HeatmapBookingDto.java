package com.labresource.backend.heatmap.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Booking DTO shaped exactly for the frontend UtilizationHeatmapPage component.
 *
 * Frontend uses:
 *   b.equipmentId  → match booking to equipment row
 *   b.start / b.end → time overlap calculation (ISO datetime string)
 *   b.status        → isUsageBooking(): only "CONFIRMED" | "COMPLETED" count
 *   b.id            → cell popover booking list key
 *   b.researcher    → cell popover — who booked (firstName + lastName joined)
 *   b.purpose       → cell popover — why booked
 *
 * Frontend isUsageBooking check:
 *   function isUsageBooking(b) {
 *     return b.status === "CONFIRMED" || b.status === "COMPLETED";
 *   }
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapBookingDto {

    /** Maps to b.id in the frontend */
    private Long id;

    /** Maps to b.equipmentId in the frontend */
    private Long equipmentId;

    /**
     * Maps to b.start in the frontend.
     * ISO-8601 datetime string e.g. "2026-08-15T10:00:00"
     * Frontend: new Date(b.start).getTime()
     */
    private String start;

    /**
     * Maps to b.end in the frontend.
     * ISO-8601 datetime string e.g. "2026-08-15T12:00:00"
     * Frontend: new Date(b.end).getTime()
     */
    private String end;

    /**
     * Maps to b.status in the frontend.
     * Frontend filters: CONFIRMED | COMPLETED only count as "usage".
     */
    private String status;

    /**
     * Maps to b.researcher in the frontend.
     * Resolved by joining Booking.userId -> AppUser.firstName + " " + AppUser.lastName
     */
    private String researcher;

    /** Maps to b.purpose in the frontend — the text entered at booking time */
    private String purpose;
}
