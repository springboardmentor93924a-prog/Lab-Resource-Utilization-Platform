package com.labresource.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    // =========================================================
    // USER
    // =========================================================

    @JsonIgnore
    @ManyToOne(
            fetch = FetchType.LAZY
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;


    // =========================================================
    // NOTIFICATION TYPE
    // =========================================================

    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false
    )
    private NotificationType type;


    // =========================================================
    // TITLE
    // =========================================================

    @Column(
            nullable = false,
            length = 200
    )
    private String title;


    // =========================================================
    // MESSAGE
    // =========================================================

    @Column(
            nullable = false,
            length = 1000
    )
    private String message;


    // =========================================================
    // READ STATUS
    // =========================================================

    @Column(
            name = "is_read",
            nullable = false
    )
    private boolean read = false;


    // =========================================================
    // REFERENCE
    // =========================================================

    @Column(
            name = "reference_id"
    )
    private Long referenceId;


    @Column(
            name = "reference_type",
            length = 100
    )
    private String referenceType;


    // =========================================================
    // CREATED TIME
    // =========================================================

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;


    // =========================================================
    // READ TIME
    // =========================================================

    @Column(
            name = "read_at"
    )
    private LocalDateTime readAt;


    // =========================================================
    // BEFORE INSERT
    // =========================================================

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {

            createdAt =
                    LocalDateTime.now();
        }
    }
}