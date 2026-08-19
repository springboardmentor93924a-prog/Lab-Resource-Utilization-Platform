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
@Table(name = "maintenance_requests")
public class MaintenanceRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @ManyToOne(optional = false)
    @JoinColumn(name = "requested_by")
    private UserEntity requestedBy;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private String priority;

    @Column(nullable = false)
    private Integer requiredDuration;

    private LocalDateTime preferredStart;

    private LocalDateTime preferredEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

}
