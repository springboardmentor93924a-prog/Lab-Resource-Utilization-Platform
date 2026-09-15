-- Migration V29: Add invoice_number, invoice_period, and indexes to Invoice table

ALTER TABLE Invoice
    ADD COLUMN invoice_number VARCHAR(100) NULL,
    ADD COLUMN invoice_period VARCHAR(50) NULL;

ALTER TABLE Invoice
    ADD CONSTRAINT uk_invoice_number UNIQUE (invoice_number);

CREATE INDEX idx_invoice_provider_requester ON Invoice(institution_id, external_institution_id, status);
