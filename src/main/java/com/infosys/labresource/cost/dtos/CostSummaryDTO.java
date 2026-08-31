package com.infosys.labresource.cost.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CostSummaryDTO {
    private Long id;
    private String name;
    private long totalBookings;
    private double totalHours;
    private BigDecimal totalCost;
}
