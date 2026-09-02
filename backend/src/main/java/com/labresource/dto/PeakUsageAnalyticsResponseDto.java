package com.labresource.dto;

import java.util.Map;

public class PeakUsageAnalyticsResponseDto {
    private Map<Integer, Long> usageByHour;
    private Integer peakHour;
    private Long peakHourUsageCount;

    public Map<Integer, Long> getUsageByHour() { return usageByHour; }
    public void setUsageByHour(Map<Integer, Long> usageByHour) { this.usageByHour = usageByHour; }
    public Integer getPeakHour() { return peakHour; }
    public void setPeakHour(Integer peakHour) { this.peakHour = peakHour; }
    public Long getPeakHourUsageCount() { return peakHourUsageCount; }
    public void setPeakHourUsageCount(Long peakHourUsageCount) { this.peakHourUsageCount = peakHourUsageCount; }
}
