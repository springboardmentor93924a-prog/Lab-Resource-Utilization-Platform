package com.labresource.backend.settings.repository;

import com.labresource.backend.settings.entity.SystemSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemSettingsRepository extends JpaRepository<SystemSettings, Long> {
}
