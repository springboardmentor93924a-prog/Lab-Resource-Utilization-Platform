package com.labresource.dto;

public class HeatmapDataResponseDto {

    private String day;
    private Integer hour;
    private Long usageCount;
    private Long totalUsageMinutes;
    private Double utilizationPercentage;

    public HeatmapDataResponseDto() {
    }

    public HeatmapDataResponseDto(
            String day,
            Integer hour,
            Long usageCount,
            Long totalUsageMinutes,
            Double utilizationPercentage
    ) {
        this.day = day;
        this.hour = hour;
        this.usageCount = usageCount;
        this.totalUsageMinutes = totalUsageMinutes;
        this.utilizationPercentage = utilizationPercentage;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public Integer getHour() {
        return hour;
    }

    public void setHour(Integer hour) {
        this.hour = hour;
    }

    public Long getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(Long usageCount) {
        this.usageCount = usageCount;
    }

    public Long getTotalUsageMinutes() {
        return totalUsageMinutes;
    }

    public void setTotalUsageMinutes(Long totalUsageMinutes) {
        this.totalUsageMinutes = totalUsageMinutes;
    }

    public Double getUtilizationPercentage() {
        return utilizationPercentage;
    }

    public void setUtilizationPercentage(
            Double utilizationPercentage
    ) {
        this.utilizationPercentage = utilizationPercentage;
    }
}

//[
//  {
//    "day": "MONDAY",
//    "hour": 9,
//    "usageCount": 4,
//    "totalUsageMinutes": 180,
//    "utilizationPercentage": 75.0
//  },
//  {
//    "day": "MONDAY",
//    "hour": 10,
//    "usageCount": 2,
//    "totalUsageMinutes": 90,
//    "utilizationPercentage": 37.5
//  }
//]