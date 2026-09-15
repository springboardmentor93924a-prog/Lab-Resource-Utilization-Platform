-- Migration V11: Make booking_id nullable in EquipmentIssueReport and add schedule/delay fields to MaintenanceRequest

-- 1. Make booking_id optional in EquipmentIssueReport for direct staff issue reporting
ALTER TABLE EquipmentIssueReport ALTER COLUMN booking_id DROP NOT NULL;

-- 2. Add Technician Proposed Schedule and Delay Justification fields to MaintenanceRequest
ALTER TABLE MaintenanceRequest ADD COLUMN IF NOT EXISTS proposed_start_datetime TIMESTAMP;
ALTER TABLE MaintenanceRequest ADD COLUMN IF NOT EXISTS proposed_end_datetime TIMESTAMP;
ALTER TABLE MaintenanceRequest ADD COLUMN IF NOT EXISTS delay_reason VARCHAR(1000);

-- 3. Add Manager Final Schedule and Decision Metadata to MaintenanceRequest
ALTER TABLE MaintenanceRequest ADD COLUMN IF NOT EXISTS final_due_date TIMESTAMP;
ALTER TABLE MaintenanceRequest ADD COLUMN IF NOT EXISTS manager_notes VARCHAR(1000);
ALTER TABLE MaintenanceRequest ADD COLUMN IF NOT EXISTS delay_decided_by BIGINT;
ALTER TABLE MaintenanceRequest ADD COLUMN IF NOT EXISTS delay_decided_at TIMESTAMP;
