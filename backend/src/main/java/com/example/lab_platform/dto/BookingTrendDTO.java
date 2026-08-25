package com.example.lab_platform.dto;

public class BookingTrendDTO {

    private String month;
    private long totalBookings;
    private long completedBookings;

    public BookingTrendDTO() {
    }

    public BookingTrendDTO(String month, long totalBookings, long completedBookings) {
        this.month = month;
        this.totalBookings = totalBookings;
        this.completedBookings = completedBookings;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getCompletedBookings() {
        return completedBookings;
    }

    public void setCompletedBookings(long completedBookings) {
        this.completedBookings = completedBookings;
    }
}
