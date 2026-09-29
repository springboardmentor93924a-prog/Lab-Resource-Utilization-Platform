package com.labresource.backend.settings.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.labresource.backend.audit.entity.AuditLog;
import com.labresource.backend.audit.repository.AuditLogRepository;
import com.labresource.backend.settings.dto.SystemSettingsDto;
import com.labresource.backend.settings.entity.SystemSettings;
import com.labresource.backend.settings.repository.SystemSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SystemSettingsService {

    private final SystemSettingsRepository repository;
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public SystemSettings getEntity() {
        return repository.findById(1L).orElseGet(() -> {
            SystemSettings defaults = new SystemSettings();
            defaults.setSettingsId(1L);
            defaults.setInstitutionRegistrationEnabled(true);
            defaults.setResearcherRegistrationEnabled(true);
            defaults.setMaintenanceMode(false);
            return defaults;
        });
    }

    @Transactional(readOnly = true)
    public SystemSettingsDto getSettings() {
        return SystemSettingsDto.fromEntity(getEntity());
    }

    @Transactional
    public SystemSettingsDto updateSettings(SystemSettingsDto dto, Long adminUserId) {
        SystemSettings existing = getEntity();

        String oldValueJson = null;
        try {
            oldValueJson = objectMapper.writeValueAsString(SystemSettingsDto.fromEntity(existing));
        } catch (Exception ignored) {}

        if (dto.getInstitutionRegistrationEnabled() != null) {
            existing.setInstitutionRegistrationEnabled(dto.getInstitutionRegistrationEnabled());
        }
        if (dto.getResearcherRegistrationEnabled() != null) {
            existing.setResearcherRegistrationEnabled(dto.getResearcherRegistrationEnabled());
        }
        if (dto.getMaintenanceMode() != null) {
            existing.setMaintenanceMode(dto.getMaintenanceMode());
        }

        existing.setUpdatedBy(adminUserId);
        existing.setUpdatedAt(LocalDateTime.now());

        SystemSettings saved = repository.save(existing);
        SystemSettingsDto result = SystemSettingsDto.fromEntity(saved);

        String newValueJson = null;
        try {
            newValueJson = objectMapper.writeValueAsString(result);
        } catch (Exception ignored) {}

        // Log setting change to AuditLog
        try {
            AuditLog log = new AuditLog();
            log.setUserId(adminUserId != null ? adminUserId : 0L);
            log.setAction("UPDATE_SYSTEM_SETTINGS");
            log.setEntityType("SystemSettings");
            log.setEntityId(1L);
            log.setOldValue(oldValueJson);
            log.setNewValue(newValueJson);
            auditLogRepository.save(log);
        } catch (Exception ignored) {}

        return result;
    }

    public boolean isInstitutionRegistrationEnabled() {
        return getSettings().getInstitutionRegistrationEnabled();
    }

    public boolean isResearcherRegistrationEnabled() {
        return getSettings().getResearcherRegistrationEnabled();
    }

    public boolean isMaintenanceMode() {
        return getSettings().getMaintenanceMode();
    }
}
