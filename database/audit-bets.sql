-- ============================================
-- COMPREHENSIVE BET AUDIT SCRIPT
-- Checks for data integrity issues
-- ============================================

-- 1. Check for orphaned bets (bet has no user or no game/prop)
SELECT '=== ORPHANED BETS ===' as check_name;
SELECT 
  b.id,
  b.user_id,
  b.game_id,
  b.prop_bet_id,
  b.amount,
  b.status,
  CASE 
    WHEN u.id IS NULL THEN 'Missing User'
    WHEN b.game_id IS NULL AND b.prop_bet_id IS NULL THEN 'No Game or Prop'
    WHEN b.game_id IS NOT NULL AND g.id IS NULL THEN 'Missing Game'
    WHEN b.prop_bet_id IS NOT NULL AND p.id IS NULL THEN 'Missing Prop'
  END as issue
FROM bets b
LEFT JOIN users u ON u.id = b.user_id
LEFT JOIN games g ON g.id = b.game_id
LEFT JOIN prop_bets p ON p.id = b.prop_bet_id
WHERE u.id IS NULL 
   OR (b.game_id IS NULL AND b.prop_bet_id IS NULL)
   OR (b.game_id IS NOT NULL AND g.id IS NULL)
   OR (b.prop_bet_id IS NOT NULL AND p.id IS NULL);

-- 2. Check for bets missing corresponding transactions
SELECT '=== BETS WITHOUT TRANSACTIONS ===' as check_name;
SELECT 
  b.id as bet_id,
  u.username,
  b.amount,
  b.bet_type,
  b.status,
  b.outcome,
  b.created_at,
  COUNT(t.id) as transaction_count
FROM bets b
JOIN users u ON u.id = b.user_id
LEFT JOIN transactions t ON t.user_id = b.user_id 
  AND t.created_at >= b.created_at - INTERVAL '5 seconds'
  AND t.created_at <= b.created_at + INTERVAL '5 seconds'
  AND ABS(t.amount) = b.amount
GROUP BY b.id, u.username, b.amount, b.bet_type, b.status, b.outcome, b.created_at
HAVING COUNT(t.id) = 0;

-- 3. Check for resolved bets without win/loss transactions
SELECT '=== RESOLVED BETS WITHOUT WIN TRANSACTIONS ===' as check_name;
SELECT 
  b.id as bet_id,
  u.username,
  b.amount,
  b.odds,
  b.potential_win,
  b.status,
  b.outcome,
  b.updated_at as resolved_at
FROM bets b
JOIN users u ON u.id = b.user_id
WHERE b.status = 'resolved' 
  AND b.outcome = 'won'
  AND NOT EXISTS (
    SELECT 1 FROM transactions t
    WHERE t.user_id = b.user_id
      AND t.type = 'win'
      AND t.created_at >= b.updated_at - INTERVAL '5 seconds'
      AND t.created_at <= b.updated_at + INTERVAL '5 seconds'
  );

-- 4. Check user balance integrity (does balance match transaction history?)
SELECT '=== BALANCE MISMATCHES ===' as check_name;
WITH user_transaction_totals AS (
  SELECT 
    user_id,
    SUM(amount) as calculated_balance
  FROM transactions
  WHERE status = 'completed'
  GROUP BY user_id
)
SELECT 
  u.username,
  u.balance as current_balance,
  COALESCE(utt.calculated_balance, 0) + 1000 as should_be_balance, -- Starting balance is 1000
  u.balance - (COALESCE(utt.calculated_balance, 0) + 1000) as difference
FROM users u
LEFT JOIN user_transaction_totals utt ON utt.user_id = u.id
WHERE ABS(u.balance - (COALESCE(utt.calculated_balance, 0) + 1000)) > 0.01 -- Allow for rounding
ORDER BY ABS(u.balance - (COALESCE(utt.calculated_balance, 0) + 1000)) DESC;

-- 5. Check for duplicate bets (same user, same game, multiple pending bets)
SELECT '=== DUPLICATE BETS ===' as check_name;
SELECT 
  u.username,
  b.game_id,
  b.prop_bet_id,
  COUNT(*) as bet_count,
  STRING_AGG(b.id::text, ', ') as bet_ids
FROM bets b
JOIN users u ON u.id = b.user_id
WHERE b.status = 'pending'
GROUP BY u.username, b.game_id, b.prop_bet_id
HAVING COUNT(*) > 1;

-- 6. Summary statistics
SELECT '=== SUMMARY STATISTICS ===' as check_name;
SELECT 
  'Total Users' as metric,
  COUNT(*) as count
FROM users
UNION ALL
SELECT 
  'Total Bets',
  COUNT(*)
FROM bets
UNION ALL
SELECT 
  'Pending Bets',
  COUNT(*)
FROM bets
WHERE status = 'pending'
UNION ALL
SELECT 
  'Resolved Bets',
  COUNT(*)
FROM bets
WHERE status = 'resolved'
UNION ALL
SELECT 
  'Total Transactions',
  COUNT(*)
FROM transactions
UNION ALL
SELECT 
  'Total $ Bet',
  ROUND(SUM(amount), 2)
FROM bets
UNION ALL
SELECT 
  'Total $ Won',
  ROUND(SUM(amount), 2)
FROM transactions
WHERE type = 'win'
UNION ALL
SELECT 
  'Total User Balance',
  ROUND(SUM(balance), 2)
FROM users;

-- 7. Recent bet activity (last 24 hours)
SELECT '=== RECENT ACTIVITY (24h) ===' as check_name;
SELECT 
  u.username,
  COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_bets,
  COUNT(CASE WHEN b.status = 'resolved' AND b.outcome = 'won' THEN 1 END) as won_bets,
  COUNT(CASE WHEN b.status = 'resolved' AND b.outcome = 'lost' THEN 1 END) as lost_bets,
  ROUND(SUM(CASE WHEN b.status = 'pending' THEN b.amount ELSE 0 END), 2) as pending_amount,
  ROUND(SUM(CASE WHEN b.status = 'resolved' AND b.outcome = 'won' THEN b.potential_win ELSE 0 END), 2) as won_amount,
  u.balance
FROM users u
LEFT JOIN bets b ON b.user_id = u.id AND b.created_at > NOW() - INTERVAL '24 hours'
GROUP BY u.id, u.username, u.balance
HAVING COUNT(b.id) > 0
ORDER BY COUNT(b.id) DESC;
