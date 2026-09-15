-- V18: Enforce equipment location and lab NOT NULL constraint

-- 1. Backfill equipment location from laboratory location where location is NULL or empty
UPDATE equipment e
SET location = l.location
FROM laboratory l
WHERE e.lab_id = l.lab_id
  AND (e.location IS NULL OR TRIM(e.location) = '');

-- 2. Enforce NOT NULL constraint on equipment.lab_id
ALTER TABLE equipment ALTER COLUMN lab_id SET NOT NULL;
