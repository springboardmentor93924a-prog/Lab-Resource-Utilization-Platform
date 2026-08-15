package com.labresource.backend.maintenance.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "MaintenanceLog")
@Getter
@Setter
@NoArgsConstructor
public class MaintenanceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @Column(name = "maintenance_id", nullable = false)
    private Long maintenanceId;

    @Column(name = "technician_id", nullable = false)
    private Long technicianId;

    @Column(name = "action_taken", nullable = false, columnDefinition = "text")
    private String actionTaken;

    @Column(name = "parts_used", columnDefinition = "text")
    private String partsUsed;

    @Column(name = "cost", nullable = false)
    private BigDecimal cost = BigDecimal.ZERO;

    @Column(name = "log_date", insertable = false, updatable = false)
    private LocalDateTime logDate;
}
