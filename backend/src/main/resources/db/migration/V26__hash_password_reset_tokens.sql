-- Migration V26: Hash Password Reset and Setup Tokens at Rest

-- 1. Invalidate any existing unconsumed raw tokens safely
UPDATE PasswordResetToken SET is_used = TRUE WHERE is_used = FALSE;

-- 2. Rename column token to token_hash
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'passwordresettoken' AND column_name = 'token'
    ) THEN
        ALTER TABLE PasswordResetToken RENAME COLUMN token TO token_hash;
    END IF;
END $$;
