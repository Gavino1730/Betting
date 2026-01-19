-- Add General Betting Incentives
-- This migration adds bonuses for:
-- 1. General betting (any game)
-- 2. Boys games (smaller bonuses than girls)
-- 3. Keeps girls games as the best bonuses
-- Run in Supabase SQL Editor

-- Add new bonus multipliers for general betting and boys games
INSERT INTO bonus_multipliers (bonus_type, multiplier, description, is_active)
VALUES 
    -- General betting bonuses (smallest)
    ('general_bet_base', 0.02, 'Base 2% bonus on any bet placed', true),
    ('bet_streak_3', 0.03, 'Additional 3% bonus for betting 3 days in a row', true),
    ('bet_streak_7', 0.05, 'Additional 5% bonus for betting 7 days in a row', true),
    
    -- Boys game bonuses (medium)
    ('boys_game_base', 0.05, 'Base 5% bonus on all boys game bets', true),
    ('boys_streak_3', 0.03, 'Additional 3% bonus for 3+ consecutive boys bets', true),
    ('boys_streak_7', 0.05, 'Additional 5% bonus for 7+ consecutive boys bets', true)
ON CONFLICT (bonus_type) DO UPDATE SET
    multiplier = EXCLUDED.multiplier,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Girls game bonuses remain the highest:
-- girls_game_base: 10% (vs 5% boys, 2% general)
-- girls_streak_3: 5% (vs 3% boys, 3% general)
-- girls_streak_7: 10% (vs 5% boys, 5% general)

-- Create enhanced bonus calculation function that works for all game types
CREATE OR REPLACE FUNCTION calculate_game_bonus(
    p_user_id UUID,
    p_team_type VARCHAR(50)
)
RETURNS DECIMAL AS $$
DECLARE
    v_bonus DECIMAL := 0;
    v_recent_streak INTEGER := 0;
    v_daily_streak INTEGER := 0;
    v_bonus_type_base VARCHAR(50);
    v_bonus_type_streak3 VARCHAR(50);
    v_bonus_type_streak7 VARCHAR(50);
BEGIN
    -- Determine which bonus types to use based on team type
    IF p_team_type = 'girls' THEN
        v_bonus_type_base := 'girls_game_base';
        v_bonus_type_streak3 := 'girls_streak_3';
        v_bonus_type_streak7 := 'girls_streak_7';
    ELSIF p_team_type = 'boys' THEN
        v_bonus_type_base := 'boys_game_base';
        v_bonus_type_streak3 := 'boys_streak_3';
        v_bonus_type_streak7 := 'boys_streak_7';
    ELSE
        -- General/unknown game type gets general bonuses
        v_bonus_type_base := 'general_bet_base';
        v_bonus_type_streak3 := NULL; -- Will use bet_streak instead
        v_bonus_type_streak7 := NULL;
    END IF;
    
    -- Get base bonus for this game type
    SELECT COALESCE(multiplier, 0) INTO v_bonus
    FROM bonus_multipliers
    WHERE bonus_type = v_bonus_type_base AND is_active = true;
    
    -- Check for consecutive game type streak (girls/boys specific)
    IF v_bonus_type_streak3 IS NOT NULL THEN
        WITH recent_bets AS (
            SELECT b.id, g.team_type,
                   ROW_NUMBER() OVER (ORDER BY b.created_at DESC) as rn
            FROM bets b
            JOIN games g ON b.game_id = g.id
            WHERE b.user_id = p_user_id
            ORDER BY b.created_at DESC
            LIMIT 10
        )
        SELECT COUNT(*) INTO v_recent_streak
        FROM recent_bets
        WHERE team_type = p_team_type AND rn <= 7
        HAVING MIN(CASE WHEN team_type != p_team_type THEN rn ELSE 999 END) > MAX(rn);
        
        -- Add streak bonuses
        IF v_recent_streak >= 7 THEN
            SELECT v_bonus + COALESCE(multiplier, 0) INTO v_bonus
            FROM bonus_multipliers
            WHERE bonus_type = v_bonus_type_streak7 AND is_active = true;
        ELSIF v_recent_streak >= 3 THEN
            SELECT v_bonus + COALESCE(multiplier, 0) INTO v_bonus
            FROM bonus_multipliers
            WHERE bonus_type = v_bonus_type_streak3 AND is_active = true;
        END IF;
    END IF;
    
    -- Check for daily betting streak (applies to all game types)
    WITH daily_bets AS (
        SELECT DISTINCT DATE(created_at) as bet_date
        FROM bets
        WHERE user_id = p_user_id
        AND created_at >= CURRENT_DATE - INTERVAL '10 days'
        ORDER BY DATE(created_at) DESC
    ),
    streak_calc AS (
        SELECT 
            bet_date,
            bet_date - ROW_NUMBER() OVER (ORDER BY bet_date DESC)::INTEGER as streak_group
        FROM daily_bets
    )
    SELECT COUNT(*) INTO v_daily_streak
    FROM streak_calc
    WHERE streak_group = (SELECT MAX(streak_group) FROM streak_calc);
    
    -- Add daily betting streak bonuses
    IF v_daily_streak >= 7 THEN
        SELECT v_bonus + COALESCE(multiplier, 0) INTO v_bonus
        FROM bonus_multipliers
        WHERE bonus_type = 'bet_streak_7' AND is_active = true;
    ELSIF v_daily_streak >= 3 THEN
        SELECT v_bonus + COALESCE(multiplier, 0) INTO v_bonus
        FROM bonus_multipliers
        WHERE bonus_type = 'bet_streak_3' AND is_active = true;
    END IF;
    
    -- Add weekend bonus if applicable
    IF EXTRACT(DOW FROM CURRENT_DATE) IN (0, 6) THEN
        SELECT v_bonus + COALESCE(multiplier, 0) INTO v_bonus
        FROM bonus_multipliers
        WHERE bonus_type = 'weekend_bonus' AND is_active = true;
    END IF;
    
    RETURN v_bonus;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_game_bonus IS 'Calculates total bonus multiplier for any game bet (general, boys, or girls)';

-- Keep the old function for backward compatibility (just calls the new one)
CREATE OR REPLACE FUNCTION calculate_girls_game_bonus(
    p_user_id UUID,
    p_team_type VARCHAR(50)
)
RETURNS DECIMAL AS $$
BEGIN
    RETURN calculate_game_bonus(p_user_id, p_team_type);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_girls_game_bonus IS 'Legacy wrapper for calculate_game_bonus - kept for backward compatibility';
