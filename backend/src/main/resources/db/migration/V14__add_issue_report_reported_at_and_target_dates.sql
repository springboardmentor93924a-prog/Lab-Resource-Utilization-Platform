-- Migration V14: Add reported_at, manager target dates, plan timestamps, final schedules, and assignment tracking fields

-- 1. EquipmentIssueReport: reported_at, reporter_role, institution_id, department_id
ALTER TABLE EquipmentIssueReport
ADD COLUMN IF NOT EXISTS reported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS reporter_role VARCHAR(50),
ADD COLUMN IF NOT EXISTS institution_id BIGINT,
ADD COLUMN IF NOT EXISTS department_id BIGINT;

-- Ensure existing rows have reported_at populated from created_at if needed
UPDATE EquipmentIssueReport SET reported_at = created_at WHERE reported_at IS NULL;

-- Ensure booking_id is nullable
ALTER TABLE EquipmentIssueReport ALTER COLUMN booking_id DROP NOT NULL;

-- 2. MaintenanceRequest: manager target dates, manager instructions, plan_submitted_at, final dates, finalized_by/at
ALTER TABLE MaintenanceRequest
ADD COLUMN IF NOT EXISTS manager_target_start_datetime TIMESTAMP,
ADD COLUMN IF NOT EXISTS manager_target_end_datetime TIMESTAMP,
ADD COLUMN IF NOT EXISTS manager_instructions TEXT,
ADD COLUMN IF NOT EXISTS plan_submitted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS final_start_datetime TIMESTAMP,
ADD COLUMN IF NOT EXISTS final_end_datetime TIMESTAMP,
ADD COLUMN IF NOT EXISTS finalized_by BIGINT,
ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMP;

-- 3. MaintenanceAssignment: seen/acknowledged, removal, and reassignment fields
ALTER TABLE MaintenanceAssignment
ADD COLUMN IF NOT EXISTS technician_seen_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS technician_acknowledged_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS removed_by BIGINT,
ADD COLUMN IF NOT EXISTS removed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS removal_reason TEXT,
ADD COLUMN IF NOT EXISTS reassigned_from_assignment_id BIGINT;
