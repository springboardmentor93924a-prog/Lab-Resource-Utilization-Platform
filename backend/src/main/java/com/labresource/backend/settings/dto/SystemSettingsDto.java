package com.labresource.backend.settings.dto;

import com.labresource.backend.settings.entity.SystemSettings;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettingsDto {

    private Boolean institutionRegistrationEnabled;
    private Boolean researcherRegistrationEnabled;
    private Boolean maintenanceMode;
    private Long updatedBy;
    private LocalDateTime updatedAt;

    public static SystemSettingsDto fromEntity(SystemSettings entity) {
        if (entity == null) {
            return new SystemSettingsDto(true, true, false, null, null);
        }
        return new SystemSettingsDto(
                Boolean.TRUE.equals(entity.getInstitutionRegistrationEnabled()),
                Boolean.TRUE.equals(entity.getResearcherRegistrationEnabled()),
                Boolean.TRUE.equals(entity.getMaintenanceMode()),
                entity.getUpdatedBy(),
                entity.getUpdatedAt()
        );
    }
}
