-- Migration V9: Inter-Institution MoU Agreement Workflow & Department Routing Schema

ALTER TABLE ResourceSharingRequest
    ADD COLUMN IF NOT EXISTS requesting_department_id BIGINT,
    ADD COLUMN IF NOT EXISTS owning_department_id BIGINT,
    ADD COLUMN IF NOT EXISTS mou_status VARCHAR(30) DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS mou_accepted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS cataloged_in_requesting_lab BOOLEAN DEFAULT FALSE;

ALTER TABLE SharingAgreement
    ADD COLUMN IF NOT EXISTS requesting_department_id BIGINT,
    ADD COLUMN IF NOT EXISTS owning_department_id BIGINT,
    ADD COLUMN IF NOT EXISTS mou_terms TEXT,
    ADD COLUMN IF NOT EXISTS cataloged_in_requesting_lab BOOLEAN DEFAULT FALSE;

-- Indexes for fast department and institution level querying
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sharing_owning_dept') THEN
        CREATE INDEX idx_sharing_owning_dept ON ResourceSharingRequest(owning_institution_id, owning_department_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sharing_requesting_dept') THEN
        CREATE INDEX idx_sharing_requesting_dept ON ResourceSharingRequest(requesting_institution_id, requesting_department_id);
    END IF;
END $$;
