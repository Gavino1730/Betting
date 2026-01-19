-- ===================================================================
-- QUICK FIX: DELETE ALL SPIN RECORDS FOR YOUR USER
-- ===================================================================
-- This will let you test the spin wheel immediately
-- Run this in Supabase SQL Editor
-- ===================================================================

-- Option 1: Delete ALL spins for all users (nuclear option for testing)
DELETE FROM wheel_spins;

-- Option 2: Delete only YOUR user's spins (replace 'your_username' with your actual username)
-- DELETE FROM wheel_spins WHERE user_id = (SELECT id FROM users WHERE username = 'your_username');

-- Option 3: Delete only today's spins for everyone
-- DELETE FROM wheel_spins WHERE spin_date = CURRENT_DATE;

-- Verify it worked
SELECT 
    COUNT(*) as total_spins_remaining,
    'All spins cleared - you can now spin!' AS message
FROM wheel_spins;
