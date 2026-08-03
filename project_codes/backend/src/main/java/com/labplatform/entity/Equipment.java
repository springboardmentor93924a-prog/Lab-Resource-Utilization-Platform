package com.labplatform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "equipment")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String category;   // e.g. Spectrometer, Microscope, Centrifuge
    private String tags;       // comma separated tags for search

    @Column(length = 2000)
    private String specifications;

    private String manualUrl;           // stored under local uploads dir (or S3 later)
    private String calibrationCertUrl;

    private String serialNumber;
    private String manufacturer;
    private LocalDate purchaseDate;
    private BigDecimal purchaseCost;
    private LocalDate lastCalibrationDate;
    private LocalDate nextCalibrationDue;

    @ManyToOne
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    private String department;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EquipmentStatus status = EquipmentStatus.AVAILABLE;

    @Builder.Default
    private boolean sharableAcrossInstitutions = false;

    private BigDecimal hourlyUsageCost; // for cost/billing module

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
