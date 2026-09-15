-- Flyway migration V15: Add technician acceptance columns to maintenanceassignment table
ALTER TABLE maintenanceassignment ADD COLUMN IF NOT EXISTS technician_response VARCHAR(50);
ALTER TABLE maintenanceassignment ADD COLUMN IF NOT EXISTS technician_accepted_at TIMESTAMP;
