package com.labresource.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Resource_Sharing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResourceSharing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sharing_id")
    private Integer sharingId;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @ManyToOne
    @JoinColumn(name = "source_institution_id")
    private Institution sourceInstitution;

    @ManyToOne
    @JoinColumn(name = "target_institution_id")
    private Institution targetInstitution;

    @ManyToOne
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    @Column(name = "approval_status")
    private String approvalStatus;

    @Column(name = "sharing_start_date")
    private LocalDate sharingStartDate;

    @Column(name = "sharing_end_date")
    private LocalDate sharingEndDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}