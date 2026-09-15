-- Migration V25: Add Registration Audit, Academic Identifiers, and Institution Code Uniqueness

-- 1. AppUser: Add academic identifiers and review audit fields
ALTER TABLE AppUser
    ADD COLUMN IF NOT EXISTS roll_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS researcher_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS reviewed_by BIGINT,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_reviewed_by') THEN
        ALTER TABLE AppUser ADD CONSTRAINT fk_user_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES AppUser(user_id);
    END IF;
END $$;

-- 2. Institution: Add review audit fields and unique code constraint
ALTER TABLE Institution
    ADD COLUMN IF NOT EXISTS reviewed_by BIGINT,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_institution_reviewed_by') THEN
        ALTER TABLE Institution ADD CONSTRAINT fk_institution_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES AppUser(user_id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_institution_code') THEN
        ALTER TABLE Institution ADD CONSTRAINT uq_institution_code UNIQUE (code);
    END IF;
END $$;
