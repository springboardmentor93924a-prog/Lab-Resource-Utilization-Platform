package com.labplatform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User requestedBy;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING_APPROVAL;

    private String purpose;

    @Builder.Default
    private boolean recurring = false;
    private String recurrenceRule; // simple RRULE-like string e.g. "WEEKLY;COUNT=4"

    private LocalDateTime actualStartTime;  // set when equipment usage begins (In Use)
    private LocalDateTime actualEndTime;    // set when usage completes

    @Builder.Default
    private boolean noShowFlag = false;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
