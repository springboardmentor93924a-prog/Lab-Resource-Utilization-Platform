-- Migration V7: Add missing condition and is_active columns to Equipment table for JPA validation

ALTER TABLE Equipment
    ADD COLUMN IF NOT EXISTS condition VARCHAR(100),
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
