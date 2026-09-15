-- Flyway migration V12: Expand status column length and drop restrictive check constraint in maintenanceassignment table
ALTER TABLE maintenanceassignment ALTER COLUMN status TYPE VARCHAR(50);
ALTER TABLE maintenanceassignment DROP CONSTRAINT IF EXISTS chk_assignment_status;
