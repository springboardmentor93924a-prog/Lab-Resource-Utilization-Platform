-- Flyway Migration V28: Add repair plan parts details, technician completion fields, completion photos, and manager verification notes

ALTER TABLE maintenancerequest
    ADD COLUMN IF NOT EXISTS parts_details TEXT,
    ADD COLUMN IF NOT EXISTS diagnostic_notes TEXT,
    ADD COLUMN IF NOT EXISTS work_performed TEXT,
    ADD COLUMN IF NOT EXISTS parts_used TEXT,
    ADD COLUMN IF NOT EXISTS completion_attachment_public_id VARCHAR(500),
    ADD COLUMN IF NOT EXISTS completion_attachment_secure_url VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS completion_attachment_file_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS verification_notes TEXT;

