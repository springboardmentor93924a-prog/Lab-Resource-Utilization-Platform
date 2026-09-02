package com.labresource.service.impl;

import com.labresource.dto.PeakUsageAnalyticsResponseDto;
import com.labresource.entity.UtilizationLog;
import com.labresource.repository.UtilizationLogRepository;
import com.labresource.service.PeakUsageAnalyticsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class PeakUsageAnalyticsServiceImpl implements PeakUsageAnalyticsService {

    private final UtilizationLogRepository utilizationLogRepository;

    public PeakUsageAnalyticsServiceImpl(UtilizationLogRepository utilizationLogRepository) {
        this.utilizationLogRepository = utilizationLogRepository;
    }

    @Override
    public PeakUsageAnalyticsResponseDto getPeakUsageAnalytics() {
        Map<Integer, Long> usageByHour = new LinkedHashMap<>();

        for (int hour = 0; hour < 24; hour++) {
            usageByHour.put(hour, 0L);
        }

        for (UtilizationLog log : utilizationLogRepository.findAll()) {
            if (log.getStartTime() == null) continue;
            int hour = log.getStartTime().getHour();
            usageByHour.put(hour, usageByHour.get(hour) + 1);
        }

        int peakHour = 0;
        long peakCount = 0;

        for (Map.Entry<Integer, Long> entry : usageByHour.entrySet()) {
            if (entry.getValue() > peakCount) {
                peakHour = entry.getKey();
                peakCount = entry.getValue();
            }
        }

        PeakUsageAnalyticsResponseDto response = new PeakUsageAnalyticsResponseDto();
        response.setUsageByHour(usageByHour);
        response.setPeakHour(peakHour);
        response.setPeakHourUsageCount(peakCount);

        return response;
    }
}
