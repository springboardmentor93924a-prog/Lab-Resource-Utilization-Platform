-- Migration V12: Add rejection_reason column to appuser table

ALTER TABLE appuser ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
