package com.infosys.labresource.booking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class BookingWaitlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long waitlistId;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Column(nullable = false)
    private LocalDateTime addedAt;

    @Column(nullable = false)
    private Boolean active = true;
}