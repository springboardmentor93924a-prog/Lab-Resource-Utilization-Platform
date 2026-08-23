package com.example.lab_platform.dto;

public class MonthlyCostDTO {

    private String month; // e.g. "2026-08"
    private double totalCost;
    private long bookingCount;

    public MonthlyCostDTO() {
    }

    public MonthlyCostDTO(String month, double totalCost, long bookingCount) {
        this.month = month;
        this.totalCost = totalCost;
        this.bookingCount = bookingCount;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(double totalCost) {
        this.totalCost = totalCost;
    }

    public long getBookingCount() {
        return bookingCount;
    }

    public void setBookingCount(long bookingCount) {
        this.bookingCount = bookingCount;
    }
}
