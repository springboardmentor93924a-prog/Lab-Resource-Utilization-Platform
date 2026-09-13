package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettings {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    // =====================================================
    // USER
    // =====================================================

    @OneToOne
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;


    // =====================================================
    // APPEARANCE
    // =====================================================

    @Builder.Default
    @Column(nullable = false)
    private String theme = "dark";


    @Builder.Default
    @Column(nullable = false)
    private Boolean compactMode = false;


    // =====================================================
    // NOTIFICATION PREFERENCES
    // =====================================================

    @Builder.Default
    @Column(nullable = false)
    private Boolean emailNotifications = true;


    @Builder.Default
    @Column(nullable = false)
    private Boolean bookingReminders = true;


    @Builder.Default
    @Column(nullable = false)
    private Boolean maintenanceReminders = true;


    @Builder.Default
    @Column(nullable = false)
    private Boolean systemNotifications = true;


    // =====================================================
    // APPLY DEFAULT VALUES
    // =====================================================

    @PrePersist
    public void applyDefaults() {

        if (theme == null || theme.isBlank()) {
            theme = "dark";
        }

        if (compactMode == null) {
            compactMode = false;
        }

        if (emailNotifications == null) {
            emailNotifications = true;
        }

        if (bookingReminders == null) {
            bookingReminders = true;
        }

        if (maintenanceReminders == null) {
            maintenanceReminders = true;
        }

        if (systemNotifications == null) {
            systemNotifications = true;
        }
    }
}