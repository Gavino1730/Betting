-- FINAL SUPABASE DEPLOYMENT SQL
-- Run this in Supabase SQL Editor for complete setup

-- ============================================
-- 1. FIX RLS POLICIES (Most Important)
-- ============================================

-- Bets table: Allow all operations (backend validates)
DROP POLICY IF EXISTS "allow_create_bets" ON bets;
DROP POLICY IF EXISTS "allow_read_own_bets" ON bets;
DROP POLICY IF EXISTS "allow_all_bets" ON bets;

CREATE POLICY "allow_all_bets" ON bets
  FOR ALL USING (true) WITH CHECK (true);

-- Transactions table: Allow all operations (backend validates)
DROP POLICY IF EXISTS "allow_read_own_transactions" ON transactions;
DROP POLICY IF EXISTS "allow_all_transactions" ON transactions;

CREATE POLICY "allow_all_transactions" ON transactions
  FOR ALL USING (true) WITH CHECK (true);

-- Games table: Allow all operations for updates
DROP POLICY IF EXISTS "allow_update_games" ON games;
DROP POLICY IF EXISTS "allow_all_games" ON games;

CREATE POLICY "allow_all_games" ON games
  FOR ALL USING (true) WITH CHECK (true);

-- Teams table: Allow all operations
DROP POLICY IF EXISTS "allow_update_teams" ON teams;
DROP POLICY IF EXISTS "allow_all_teams" ON teams;

CREATE POLICY "allow_all_teams" ON teams
  FOR ALL USING (true) WITH CHECK (true);

-- Users table: Allow reading all users (for leaderboard)
DROP POLICY IF EXISTS "allow_read_all_users" ON users;
DROP POLICY IF EXISTS "allow_registration" ON users;
DROP POLICY IF EXISTS "allow_update_users" ON users;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_read_all_users" ON users
  FOR SELECT USING (true);

CREATE POLICY "allow_registration" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_update_users" ON users
  FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================
-- 2. ADD MISSING COLUMNS
-- ============================================

-- Add is_visible to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;
UPDATE games SET is_visible = TRUE WHERE is_visible IS NULL;

-- ============================================
-- 3. CREATE ADMIN USER (Optional)
-- ============================================
-- First register through website with username 'admin' and password 'Boyaca1730!'
-- Then run this to make them admin:

UPDATE users 
SET is_admin = true, balance = 10000
WHERE username = 'admin';

-- ============================================
-- DONE!
-- ============================================
