package com.labresource.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name="Booking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="booking_id")
    private Integer bookingId;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name="equipment_id")
    private Equipment equipment;

    @Column(name="booking_date")
    private LocalDate bookingDate;

    @Column(name="start_time")
    private LocalTime startTime;

    @Column(name="end_time")
    private LocalTime endTime;

    @Column(name="purpose")
    private String purpose;

    @Column(name="status")
    private String status;

    @Column(name="created_at")
    private LocalDateTime createdAt;

}