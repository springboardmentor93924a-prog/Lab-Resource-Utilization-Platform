-- Migration V11: Add approval_status and rejection_reason to institution table

ALTER TABLE institution ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'APPROVED';
ALTER TABLE institution ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
