package com.infosys.labresource.maintainance.Entities;

import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.user.entites.UserEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "work_orders")
public class WorkOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long workOrderId;

    @OneToOne(optional = false)
    @JoinColumn(name = "schedule_id", unique = true)
    private MaintenanceSchedule maintenanceSchedule;

    @ManyToOne(optional = false)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @ManyToOne
    @JoinColumn(name = "assigned_technician")
    private UserEntity assignedTechnician;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private orderStatus status = orderStatus.CREATED;

    private LocalDateTime actualStart;

    private LocalDateTime actualEnd;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime completedAt;
}
