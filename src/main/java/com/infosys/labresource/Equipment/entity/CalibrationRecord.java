package com.infosys.labresource.Equipment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "calibration_records")

public class CalibrationRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long calibrationId;

    @OneToOne(optional = false)
    @JoinColumn(name = "equipment_id", nullable = false, unique = true)
    private Equipment equipment;

    @Column(name = "last_calibration_date")
    private LocalDate lastCalibrationDate;

    @Column(name = "next_calibration_date")
    private LocalDate nextCalibrationDate;

    @Column(name = "calibration_interval_months")
    private Integer calibrationIntervalMonths;

    @Column(name = "certification_number")
    private String certificationNumber;

    @Column(name = "certification_issue_date")
    private LocalDate certificationIssueDate;

    @Column(name = "certification_expiry_date")
    private LocalDate certificationExpiryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "certification_status")
    private CertificationStatus certificationStatus;
}
