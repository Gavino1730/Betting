-- ===================================================================
-- RESET SPIN WHEEL FOR TODAY
-- ===================================================================
-- Run this to check and clear today's spin records
-- This allows you to test the spin wheel feature
-- ===================================================================

-- 1. Check current spins for today
SELECT 
    ws.id,
    u.username,
    ws.spin_date,
    ws.reward_amount,
    ws.spin_time
FROM wheel_spins ws
JOIN users u ON ws.user_id = u.id
WHERE ws.spin_date = CURRENT_DATE
ORDER BY ws.spin_time DESC;

-- 2. UNCOMMENT BELOW TO DELETE TODAY'S SPINS (allows you to spin again)
-- DELETE FROM wheel_spins WHERE spin_date = CURRENT_DATE;

-- 3. Verify deletion
-- SELECT COUNT(*) as spins_today FROM wheel_spins WHERE spin_date = CURRENT_DATE;

-- ===================================================================
-- INSTRUCTIONS:
-- ===================================================================
-- Step 1: Run the SELECT query above to see if you have spins today
-- Step 2: If you want to reset and spin again, uncomment the DELETE line
-- Step 3: Run the verification query to confirm it's cleared
-- ===================================================================

SELECT 
    'Check complete!' AS status,
    'Uncomment DELETE line to reset spins' AS next_step;
