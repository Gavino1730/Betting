-- ============================================
-- ADD MISSING DATABASE FUNCTIONS
-- ============================================
-- Run this if you're seeing 500 errors due to missing RPC functions
-- These functions are called by the application but were not in original setup
-- ============================================

-- Function to safely update user balance (atomic operation to prevent race conditions)
CREATE OR REPLACE FUNCTION update_user_balance(p_user_id UUID, p_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET balance = balance + p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found: %', p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a user and all related data (cascade delete)
CREATE OR REPLACE FUNCTION delete_user_cascade(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Delete in order to respect foreign key constraints
    DELETE FROM achievements WHERE user_id = p_user_id;
    DELETE FROM wheel_spins WHERE user_id = p_user_id;
    DELETE FROM daily_logins WHERE user_id = p_user_id;
    DELETE FROM notifications WHERE user_id = p_user_id;
    DELETE FROM transactions WHERE user_id = p_user_id;
    DELETE FROM bets WHERE user_id = p_user_id;
    DELETE FROM referrals WHERE referrer_id = p_user_id OR referred_id = p_user_id;
    DELETE FROM users WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate game bonus for a user based on team type
-- Returns a decimal multiplier (e.g., 0.10 for 10% bonus)
CREATE OR REPLACE FUNCTION calculate_game_bonus(p_user_id UUID, p_team_type TEXT)
RETURNS DECIMAL AS $$
DECLARE
    v_bet_count INTEGER;
    v_bonus DECIMAL := 0;
BEGIN
    -- Count bets user has placed on this team type today
    SELECT COUNT(*) INTO v_bet_count
    FROM bets b
    JOIN games g ON b.game_id = g.id
    WHERE b.user_id = p_user_id
    AND g.team_type = p_team_type
    AND DATE(b.created_at) = CURRENT_DATE;
    
    -- Bonus tiers: More bets = higher bonus (encourages engagement)
    -- 2nd bet on same team type: 5% bonus
    -- 3rd bet: 10% bonus
    -- 4th+ bet: 15% bonus
    IF v_bet_count >= 4 THEN
        v_bonus := 0.15;
    ELSIF v_bet_count = 3 THEN
        v_bonus := 0.10;
    ELSIF v_bet_count = 2 THEN
        v_bonus := 0.05;
    END IF;
    
    RETURN v_bonus;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has bet on all available girls games today
CREATE OR REPLACE FUNCTION check_all_girls_games_bet(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_total_games INTEGER;
    v_user_bets INTEGER;
BEGIN
    -- Count visible girls games available today
    SELECT COUNT(*) INTO v_total_games
    FROM games
    WHERE is_visible = true 
    AND status = 'scheduled'
    AND (team_type ILIKE '%girls%' OR team_type ILIKE '%girl%')
    AND game_date = CURRENT_DATE;
    
    -- If no games today, return false
    IF v_total_games = 0 THEN
        RETURN false;
    END IF;
    
    -- Count unique girls games user has bet on today
    SELECT COUNT(DISTINCT b.game_id) INTO v_user_bets
    FROM bets b
    JOIN games g ON b.game_id = g.id
    WHERE b.user_id = p_user_id
    AND DATE(b.created_at) = CURRENT_DATE
    AND g.is_visible = true 
    AND (g.team_type ILIKE '%girls%' OR g.team_type ILIKE '%girl%')
    AND g.game_date = CURRENT_DATE;
    
    RETURN v_user_bets >= v_total_games;
END;
$$ LANGUAGE plpgsql;

-- Function to award weekly bonuses (called by cron/scheduler)
CREATE OR REPLACE FUNCTION award_weekly_bonuses()
RETURNS TABLE(user_id UUID, bonus_amount INTEGER, bonus_type TEXT) AS $$
BEGIN
    -- Award top 3 bettors of the week with bonus
    RETURN QUERY
    WITH weekly_stats AS (
        SELECT 
            b.user_id,
            SUM(CASE WHEN b.outcome = 'won' THEN b.potential_win - b.amount ELSE 0 END) as weekly_profit,
            COUNT(*) as total_bets,
            SUM(CASE WHEN b.outcome = 'won' THEN 1 ELSE 0 END) as wins
        FROM bets b
        WHERE b.created_at >= CURRENT_DATE - INTERVAL '7 days'
        AND b.status = 'resolved'
        GROUP BY b.user_id
        HAVING COUNT(*) >= 5 -- Must have at least 5 bets
    ),
    ranked_users AS (
        SELECT 
            user_id,
            weekly_profit,
            RANK() OVER (ORDER BY weekly_profit DESC) as rank
        FROM weekly_stats
        WHERE weekly_profit > 0
    )
    SELECT 
        ru.user_id,
        CASE 
            WHEN ru.rank = 1 THEN 500
            WHEN ru.rank = 2 THEN 250
            WHEN ru.rank = 3 THEN 100
            ELSE 0
        END as bonus_amount,
        CASE 
            WHEN ru.rank = 1 THEN 'weekly_top_1'
            WHEN ru.rank = 2 THEN 'weekly_top_2'
            WHEN ru.rank = 3 THEN 'weekly_top_3'
            ELSE 'none'
        END as bonus_type
    FROM ranked_users ru
    WHERE ru.rank <= 3;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Grant execute permissions
-- ============================================
GRANT EXECUTE ON FUNCTION update_user_balance(UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_cascade(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_game_bonus(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_all_girls_games_bet(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION award_weekly_bonuses() TO authenticated;

-- Also grant to anon for public access where needed
GRANT EXECUTE ON FUNCTION calculate_game_bonus(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION check_all_girls_games_bet(UUID) TO anon;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
    'Missing functions added! ✅' AS status,
    'update_user_balance' AS func1,
    'delete_user_cascade' AS func2,
    'calculate_game_bonus' AS func3,
    'check_all_girls_games_bet' AS func4,
    'award_weekly_bonuses' AS func5;
