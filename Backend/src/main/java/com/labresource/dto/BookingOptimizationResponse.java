package com.labresource.dto;

import java.time.LocalTime;

public class BookingOptimizationResponse {

    private boolean available;
    private LocalTime recommendedStartTime;
    private LocalTime recommendedEndTime;
    private String message;

    public BookingOptimizationResponse() {
    }

    public BookingOptimizationResponse(
            boolean available,
            LocalTime recommendedStartTime,
            LocalTime recommendedEndTime,
            String message
    ) {
        this.available = available;
        this.recommendedStartTime = recommendedStartTime;
        this.recommendedEndTime = recommendedEndTime;
        this.message = message;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public LocalTime getRecommendedStartTime() {
        return recommendedStartTime;
    }

    public void setRecommendedStartTime(
            LocalTime recommendedStartTime
    ) {
        this.recommendedStartTime = recommendedStartTime;
    }

    public LocalTime getRecommendedEndTime() {
        return recommendedEndTime;
    }

    public void setRecommendedEndTime(
            LocalTime recommendedEndTime
    ) {
        this.recommendedEndTime = recommendedEndTime;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
