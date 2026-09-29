-- Migration V31: Add SystemSettings table for platform configuration
CREATE TABLE IF NOT EXISTS SystemSettings (
    settings_id BIGINT PRIMARY KEY,
    institution_registration_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    researcher_registration_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    updated_by BIGINT,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO SystemSettings (settings_id, institution_registration_enabled, researcher_registration_enabled, maintenance_mode)
VALUES (1, TRUE, TRUE, FALSE)
ON CONFLICT (settings_id) DO NOTHING;
