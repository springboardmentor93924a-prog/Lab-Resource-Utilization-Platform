-- Migration for EquipmentIssueReport Incident Timestamp & Damage Acknowledgment fields

ALTER TABLE EquipmentIssueReport
    ADD COLUMN incident_timestamp TIMESTAMP NULL,
    ADD COLUMN damage_acknowledged BOOLEAN NOT NULL DEFAULT FALSE;
