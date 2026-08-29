package com.labplatform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_tasks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MaintenanceTask {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id")
    private User technician;

    @Column(nullable = false)
    private String taskDescription;

    @Enumerated(EnumType.STRING)
    private MaintenanceStatus status;

    private LocalDateTime scheduledDate;
    private LocalDateTime completedDate;
    private String serviceNotes;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}