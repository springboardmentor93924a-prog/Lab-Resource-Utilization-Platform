package com.labresource.dto;

public class AvailabilityResponse {

    private boolean available;
    private String message;

    public AvailabilityResponse() {
    }

    public AvailabilityResponse(
            boolean available,
            String message
    ) {
        this.available = available;
        this.message = message;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}