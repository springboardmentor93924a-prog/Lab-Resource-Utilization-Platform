package com.labresource.dto;

public class NoShowAnalyticsResponseDto {
    private long totalBookings;
    private long noShowBookings;
    private double noShowRate;

    public NoShowAnalyticsResponseDto() {}

    public NoShowAnalyticsResponseDto(long totalBookings, long noShowBookings, double noShowRate) {
        this.totalBookings = totalBookings;
        this.noShowBookings = noShowBookings;
        this.noShowRate = noShowRate;
    }

    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }
    public long getNoShowBookings() { return noShowBookings; }
    public void setNoShowBookings(long noShowBookings) { this.noShowBookings = noShowBookings; }
    public double getNoShowRate() { return noShowRate; }
    public void setNoShowRate(double noShowRate) { this.noShowRate = noShowRate; }
}
