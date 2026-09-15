-- Migration V30: Update CostRecord cost_type constraint to support DAMAGE_CHARGE
ALTER TABLE CostRecord DROP CONSTRAINT IF EXISTS chk_cost_type;

ALTER TABLE CostRecord ADD CONSTRAINT chk_cost_type 
    CHECK (cost_type IN ('USAGE', 'MAINTENANCE', 'SHARING_FEE', 'DAMAGE_CHARGE'));
