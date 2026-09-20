package com.labresource.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Maintenance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maintenance_id")
    private Integer maintenanceId;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @ManyToOne
    @JoinColumn(name = "technician_id")
    private User technician;

    @Column(name = "maintenance_date")
    private LocalDate maintenanceDate;

    @Column(name = "maintenance_type")
    private String maintenanceType;

    @Column(name = "description")
    private String description;

    @Column(name = "status")
    private String status;

    @Column(name = "next_service_date")
    private LocalDate nextServiceDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}