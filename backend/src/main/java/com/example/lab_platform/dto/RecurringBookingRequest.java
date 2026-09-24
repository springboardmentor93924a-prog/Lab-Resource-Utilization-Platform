package com.example.lab_platform.dto;

import java.time.LocalDateTime;

/**
 * Request to book the same slot repeatedly (recurring booking).
 * repeat = DAILY or WEEKLY; occurrences = total number of bookings (2-12),
 * including the first one.
 */
public class RecurringBookingRequest {

    private Integer equipmentId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private String repeat;
    private Integer occurrences;

    public Integer getEquipmentId() { return equipmentId; }
    public void setEquipmentId(Integer equipmentId) { this.equipmentId = equipmentId; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getRepeat() { return repeat; }
    public void setRepeat(String repeat) { this.repeat = repeat; }

    public Integer getOccurrences() { return occurrences; }
    public void setOccurrences(Integer occurrences) { this.occurrences = occurrences; }
}