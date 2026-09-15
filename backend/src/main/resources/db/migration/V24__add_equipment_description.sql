-- Migration V24: Add description column to Equipment table
ALTER TABLE Equipment
    ADD COLUMN IF NOT EXISTS description TEXT;
