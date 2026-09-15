-- Flyway migration V13: Add cancellation tracking fields to MaintenanceRequest table
ALTER TABLE MaintenanceRequest ADD COLUMN IF NOT EXISTS cancelled_by BIGINT;
ALTER TABLE MaintenanceRequest ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;
ALTER TABLE MaintenanceRequest ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
