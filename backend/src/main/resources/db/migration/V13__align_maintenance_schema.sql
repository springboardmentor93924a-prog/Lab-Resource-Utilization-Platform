-- Flyway V13 Migration: Align Maintenance Request Status Constraint & Add Audit Trail Date & Decision Columns

ALTER TABLE maintenancerequest DROP CONSTRAINT IF EXISTS chk_maintenance_status;

ALTER TABLE maintenancerequest ADD CONSTRAINT chk_maintenance_status 
CHECK (status IN (
    'OPEN', 
    'ASSIGNED', 
    'IN_PROGRESS', 
    'WAITING_FOR_PARTS', 
    'ON_HOLD', 
    'WAITING_MANAGER_APPROVAL', 
    'FINAL_MANAGER_DIRECTIVE', 
    'REPAIR_IN_PROGRESS', 
    'PENDING_VERIFICATION', 
    'COMPLETED', 
    'REJECTED', 
    'CANCELLED'
));

ALTER TABLE maintenancerequest 
ADD COLUMN IF NOT EXISTS proposed_completion_date DATE,
ADD COLUMN IF NOT EXISTS final_due_date DATE,
ADD COLUMN IF NOT EXISTS delay_reason TEXT,
ADD COLUMN IF NOT EXISTS manager_notes TEXT,
ADD COLUMN IF NOT EXISTS requires_parts BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS delay_decided_by BIGINT,
ADD COLUMN IF NOT EXISTS delay_decided_at TIMESTAMP;
