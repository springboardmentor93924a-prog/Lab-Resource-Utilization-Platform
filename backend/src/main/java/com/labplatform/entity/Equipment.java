package com.labplatform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Equipment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
    private String modelNumber;
    private String category;
    private String specifications;

    @Enumerated(EnumType.STRING)
    private EquipmentStatus status;

    private Double hourlyRate;
    private Boolean allowInterInstitution;
    private String department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "institution_id")
    private Institution institution;

    private LocalDateTime lastCalibrationDate;
    private LocalDateTime nextCalibrationDueDate;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}