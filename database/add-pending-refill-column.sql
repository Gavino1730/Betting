-- Add column to track when user's balance first hit zero
-- This is used for the 48-hour wait period before refill

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS pending_refill_timestamp TIMESTAMP DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN users.pending_refill_timestamp IS 'Timestamp when balance first hit $0. User must wait 48 hours from this time to receive refill.';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'pending_refill_timestamp';
