-- ============================================
-- CONSOLIDATED MIGRATIONS
-- Run this file for all prop bet functionality
-- ============================================

-- 1. Add prop_bet_id column and make game_id optional
ALTER TABLE bets
  ALTER COLUMN game_id DROP NOT NULL;

ALTER TABLE bets
  ADD COLUMN IF NOT EXISTS prop_bet_id INTEGER REFERENCES prop_bets(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_bets_prop_bet_id ON bets(prop_bet_id);

-- Add constraint: must have either game_id OR prop_bet_id (not both, not neither)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bets_game_or_prop_check'
  ) THEN
    ALTER TABLE bets
      ADD CONSTRAINT bets_game_or_prop_check CHECK (
        (game_id IS NOT NULL AND prop_bet_id IS NULL)
        OR (game_id IS NULL AND prop_bet_id IS NOT NULL)
      );
  END IF;
END $$;

-- 2. Add options and option_odds columns for custom prop bets
ALTER TABLE prop_bets 
ADD COLUMN IF NOT EXISTS options JSONB;

ALTER TABLE prop_bets 
ADD COLUMN IF NOT EXISTS option_odds JSONB;

-- 3. Add is_visible column for prop bets
ALTER TABLE prop_bets 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_prop_bets_visible ON prop_bets(is_visible);

-- 4. Add pending_refill_at column for balance refills
ALTER TABLE users
ADD COLUMN IF NOT EXISTS pending_refill_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_users_pending_refill ON users(pending_refill_at)
WHERE pending_refill_at IS NOT NULL;

-- Verify all changes
SELECT 'bets table columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bets' AND column_name IN ('game_id', 'prop_bet_id')
ORDER BY ordinal_position;

SELECT 'prop_bets table columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'prop_bets' AND column_name IN ('options', 'option_odds', 'is_visible')
ORDER BY ordinal_position;

SELECT 'users table columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'pending_refill_at'
ORDER BY ordinal_position;
