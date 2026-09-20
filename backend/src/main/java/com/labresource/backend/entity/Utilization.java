package com.labresource.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.math.BigDecimal;
@Entity
@Table(name = "Utilization")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Utilization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "utilization_id")
    private Integer utilizationId;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(name = "usage_hours")
private BigDecimal usageHours;

@Column(name = "idle_hours")
private BigDecimal idleHours;

@Column(name = "utilization_rate")
private BigDecimal utilizationRate;

    @Column(name = "recorded_date")
    private LocalDate recordedDate;
}