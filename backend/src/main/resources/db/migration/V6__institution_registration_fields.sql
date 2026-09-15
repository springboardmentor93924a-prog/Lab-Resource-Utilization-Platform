-- Migration V6: Institution Registration Schema Enhancements & Code Uniqueness

ALTER TABLE Institution
    ADD COLUMN IF NOT EXISTS code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS institution_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS pincode VARCHAR(20),
    ADD COLUMN IF NOT EXISTS website VARCHAR(255),
    ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE Department
    ADD COLUMN IF NOT EXISTS code VARCHAR(50);

ALTER TABLE Equipment
    ADD COLUMN IF NOT EXISTS condition VARCHAR(100),
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_dept_inst_code') THEN
        ALTER TABLE Department ADD CONSTRAINT uq_dept_inst_code UNIQUE (institution_id, code);
    END IF;
END $$;
