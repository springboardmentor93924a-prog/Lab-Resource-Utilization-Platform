-- Migration V10: Add User Deactivation Fields & Update Unique Indexes

ALTER TABLE AppUser ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP;
ALTER TABLE AppUser ADD COLUMN IF NOT EXISTS deactivation_reason VARCHAR(1000);
ALTER TABLE AppUser ADD COLUMN IF NOT EXISTS deactivated_by BIGINT;

-- Drop prior V8 partial unique indexes on StaffInvitation that included 'ACCEPTED'
DROP INDEX IF EXISTS idx_uq_dept_head_invitation;
DROP INDEX IF EXISTS idx_uq_lab_mgr_invitation;

-- Create partial unique index on StaffInvitation for PENDING status only
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_uq_dept_head_invitation_pending') THEN
        CREATE UNIQUE INDEX idx_uq_dept_head_invitation_pending ON StaffInvitation(institution_id, department_id, role_name)
        WHERE role_name = 'DEPARTMENT_HEAD' AND status = 'PENDING';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_uq_lab_mgr_invitation_pending') THEN
        CREATE UNIQUE INDEX idx_uq_lab_mgr_invitation_pending ON StaffInvitation(institution_id, department_id, role_name)
        WHERE role_name = 'LAB_MANAGER' AND status = 'PENDING';
    END IF;
END $$;
