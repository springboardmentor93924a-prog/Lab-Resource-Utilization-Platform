-- Flyway V17 Migration: Add PENDING_MANAGER_REVIEW and FINALIZED to MaintenanceRequest status constraint

ALTER TABLE maintenancerequest DROP CONSTRAINT IF EXISTS chk_maintenance_status;

ALTER TABLE maintenancerequest ADD CONSTRAINT chk_maintenance_status 
CHECK (status IN (
    'OPEN', 
    'ASSIGNED', 
    'ACCEPTED',
    'IN_PROGRESS', 
    'WAITING_FOR_PARTS', 
    'ON_HOLD', 
    'PENDING_MANAGER_REVIEW',
    'WAITING_MANAGER_APPROVAL', 
    'FINALIZED',
    'FINAL_MANAGER_DIRECTIVE', 
    'REPAIR_IN_PROGRESS', 
    'PENDING_VERIFICATION', 
    'COMPLETED', 
    'REJECTED', 
    'CANCELLED'
));
