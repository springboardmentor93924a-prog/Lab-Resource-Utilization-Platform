-- Flyway migration V16: Add assignment schedule, proposal, and audit columns to maintenanceassignment table

ALTER TABLE maintenanceassignment
ADD COLUMN IF NOT EXISTS target_start_datetime TIMESTAMP,
ADD COLUMN IF NOT EXISTS target_completion_datetime TIMESTAMP,
ADD COLUMN IF NOT EXISTS proposed_start_datetime TIMESTAMP,
ADD COLUMN IF NOT EXISTS proposed_completion_datetime TIMESTAMP,
ADD COLUMN IF NOT EXISTS delay_justification TEXT,
ADD COLUMN IF NOT EXISTS delay_requested_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS final_start_datetime TIMESTAMP,
ADD COLUMN IF NOT EXISTS final_completion_datetime TIMESTAMP,
ADD COLUMN IF NOT EXISTS finalized_by BIGINT,
ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMP;
