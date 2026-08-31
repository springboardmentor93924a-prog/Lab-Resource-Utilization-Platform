package com.labresource.dto;

import java.time.LocalTime;

public class TimeSlotResponse {

    private LocalTime startTime;
    private LocalTime endTime;
    private boolean available;
    private String status;

    public TimeSlotResponse() {
    }

    public TimeSlotResponse(
            LocalTime startTime,
            LocalTime endTime,
            boolean available,
            String status
    ) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.available = available;
        this.status = status;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

