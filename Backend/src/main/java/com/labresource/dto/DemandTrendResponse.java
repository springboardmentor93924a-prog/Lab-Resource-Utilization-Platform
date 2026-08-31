package com.labresource.dto;

import java.time.LocalDate;

public class DemandTrendResponse {

    private LocalDate date;
    private long bookingCount;

    public DemandTrendResponse() {
    }

    public DemandTrendResponse(
            LocalDate date,
            long bookingCount) {

        this.date = date;
        this.bookingCount = bookingCount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public long getBookingCount() {
        return bookingCount;
    }

    public void setBookingCount(long bookingCount) {
        this.bookingCount = bookingCount;
    }
}