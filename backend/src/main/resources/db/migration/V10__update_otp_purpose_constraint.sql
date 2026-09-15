-- Migration V10: Allow FORGOT_PASSWORD purpose in otpverification table constraint

ALTER TABLE otpverification DROP CONSTRAINT IF EXISTS chk_otp_purpose;

-- Add updated check constraint to allow FORGOT_PASSWORD
ALTER TABLE otpverification ADD CONSTRAINT chk_otp_purpose 
    CHECK (purpose IN ('REGISTRATION', 'LOGIN', 'PASSWORD_RESET', 'FORGOT_PASSWORD', 'EMAIL_VERIFICATION'));
