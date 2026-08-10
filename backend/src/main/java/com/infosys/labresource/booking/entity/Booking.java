package com.infosys.labresource.booking.entity;

import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.user.entites.UserEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Builder
@Getter
@Setter
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long booking_id;
@ManyToOne
@JoinColumn(name="Equip_id")
    private Equipment equipment;
@ManyToOne
@JoinColumn(name="userId")
private UserEntity userid;
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private UserEntity approvedBy;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;
    @Column(nullable = false)
    private LocalDateTime startTime;
    @Column(nullable = false)
    private LocalDateTime endTime;
}
