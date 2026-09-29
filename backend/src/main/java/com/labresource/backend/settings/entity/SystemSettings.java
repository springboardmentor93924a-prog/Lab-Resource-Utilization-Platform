package com.labresource.backend.settings.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "SystemSettings")
@Getter
@Setter
@NoArgsConstructor
public class SystemSettings {

    @Id
    @Column(name = "settings_id")
    private Long settingsId = 1L;

    @Column(name = "institution_registration_enabled", nullable = false)
    private Boolean institutionRegistrationEnabled = true;

    @Column(name = "researcher_registration_enabled", nullable = false)
    private Boolean researcherRegistrationEnabled = true;

    @Column(name = "maintenance_mode", nullable = false)
    private Boolean maintenanceMode = false;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
