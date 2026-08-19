package com.infosys.labresource.maintainance.Entities;

import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.user.entites.UserEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "maintenance_schedules")
public class MaintenanceSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scheduleId;

    @OneToOne(optional = false)
    @JoinColumn(name = "request_id", unique = true)
    private MaintenanceRequest maintenanceRequest;

    @ManyToOne(optional = false)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(nullable = false)
    private LocalDateTime scheduledStart;

    @Column(nullable = false)
    private LocalDateTime scheduledEnd;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

}
