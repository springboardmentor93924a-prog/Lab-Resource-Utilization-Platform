-- V27__add_booking_rejection_and_agreement_fields.sql
-- Add REJECTED status to booking table check constraint, rejection details, and agreement acceptance columns.

-- 1. Drop existing status check constraint and re-add with 'REJECTED' included
ALTER TABLE booking DROP CONSTRAINT IF EXISTS chk_booking_status;

ALTER TABLE booking ADD CONSTRAINT chk_booking_status 
    CHECK (status IN ('PENDING_APPROVAL', 'CONFIRMED', 'IN_USE', 'COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'));

-- 2. Add rejection details
ALTER TABLE booking ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;
ALTER TABLE booking ADD COLUMN IF NOT EXISTS rejected_by BIGINT NULL;
ALTER TABLE booking ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP NULL;

-- 3. Add agreement acceptance details
ALTER TABLE booking ADD COLUMN IF NOT EXISTS agreement_accepted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE booking ADD COLUMN IF NOT EXISTS agreement_version VARCHAR(50) NULL;
ALTER TABLE booking ADD COLUMN IF NOT EXISTS agreement_accepted_at TIMESTAMP NULL;

-- 4. Add foreign key constraint for rejected_by referencing appuser(user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_booking_rejector'
    ) THEN
        ALTER TABLE booking 
            ADD CONSTRAINT fk_booking_rejector 
            FOREIGN KEY (rejected_by) REFERENCES appuser(user_id);
    END IF;
END $$;

-- 5. Add index on rejected_by
CREATE INDEX IF NOT EXISTS idx_booking_rejected_by ON booking(rejected_by);
