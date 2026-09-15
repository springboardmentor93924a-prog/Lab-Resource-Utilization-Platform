-- Flyway migration V19: Add problem_description to MaintenanceAssignment
ALTER TABLE maintenanceassignment
ADD COLUMN IF NOT EXISTS problem_description TEXT;
