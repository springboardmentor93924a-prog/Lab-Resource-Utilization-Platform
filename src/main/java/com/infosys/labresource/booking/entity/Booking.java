package com.infosys.labresource.booking.entity;

import com.infosys.labresource.Equipment.entity.Equipment;
import com.infosys.labresource.user.entites.Institution;
import com.infosys.labresource.user.entites.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;
@ManyToOne
@JoinColumn(name="Equip_id")
    private Equipment equipment;
@ManyToOne
@JoinColumn(name="requested_by")
private UserEntity requestedBy;
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
    @ManyToOne
    @JoinColumn(name = "institution_id")
    private Institution institution;
}
