-- Migration for Negotiated MOU Inter-Institution Sharing Workflow
-- Adds two-way rejection reasons, MOU counter-proposal fields, and hourly rates

ALTER TABLE ResourceSharingRequest
    ALTER COLUMN status TYPE VARCHAR(30),
    ADD COLUMN rejection_reason TEXT NULL,
    ADD COLUMN mou_rejection_reason TEXT NULL,
    ADD COLUMN proposed_hourly_rate DECIMAL(10,2) NULL,
    ADD COLUMN mou_terms TEXT NULL,
    ADD COLUMN available_start_time TIME NULL,
    ADD COLUMN available_end_time TIME NULL;

ALTER TABLE ResourceSharingRequest
    DROP CONSTRAINT IF EXISTS chk_sharing_request_status;

ALTER TABLE ResourceSharingRequest
    ADD CONSTRAINT chk_sharing_request_status CHECK (status IN ('PENDING','MOU_PROPOSED','APPROVED','REJECTED','MOU_REJECTED','CANCELLED'));

ALTER TABLE ResourceSharingRequest
    ADD CONSTRAINT chk_proposed_hourly_rate CHECK (proposed_hourly_rate IS NULL OR proposed_hourly_rate >= 0);

ALTER TABLE SharingAgreement
    ADD COLUMN hourly_rate DECIMAL(10,2) NULL,
    ADD COLUMN terms_accepted_by BIGINT NULL,
    ADD COLUMN terms_accepted_at TIMESTAMP NULL;

ALTER TABLE SharingAgreement
    ADD CONSTRAINT fk_agreement_terms_acceptor FOREIGN KEY (terms_accepted_by) REFERENCES AppUser(user_id),
    ADD CONSTRAINT chk_agreement_hourly_rate CHECK (hourly_rate IS NULL OR hourly_rate >= 0);
