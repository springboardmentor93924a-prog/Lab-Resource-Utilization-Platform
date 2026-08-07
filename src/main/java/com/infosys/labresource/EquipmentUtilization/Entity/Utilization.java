package com.infosys.labresource.EquipmentUtilization.Entity;

import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.booking.entity.Booking;
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
public class Utilization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long utilizationId;

    @ManyToOne
    @JoinColumn(name = "equip_id", nullable = false)
    private Equipment equipment;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    private UtilizationStatus status;

    private Double usageHours;

    private LocalDateTime lastUpdated;
}
