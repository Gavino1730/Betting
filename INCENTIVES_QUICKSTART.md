# Quick Start: Enable Betting Incentives

## What This Does
Adds bonuses to all bets placed on your platform:
- 🎀 **Girls games**: Up to 20% bonus (BEST!)
- 🏀 **Boys games**: Up to 10% bonus
- ⭐ **All bets**: Up to 7% bonus
- 🎉 **Weekends**: Extra 5% on everything

## Installation (5 Minutes)

### Step 1: Run Database Migration
1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy the contents of `database/add-general-betting-incentives.sql`
4. Paste into SQL Editor
5. Click **Run**

Expected output: `Success. No rows returned`

### Step 2: Restart Your Backend
```bash
cd server
npm start
```

### Step 3: Test It
1. Log into your site
2. Place a bet on any game
3. You should see a bonus notification:
   - Girls: "🎀 +10% Girls Game Bonus!"
   - Boys: "🏀 +5% Boys Game Bonus!"
   - Other: "⭐ +2% Betting Bonus!"

## How It Works

### User Places Bet
System automatically:
1. Checks game type (girls/boys/general)
2. Calculates applicable bonuses (base + streaks + weekend)
3. Shows bonus percentage in notification
4. Stores bonus with bet

### User Wins Bet
System automatically:
1. Calculates base winnings (amount × odds)
2. Adds bonus (winnings × bonus%)
3. Credits total to user balance
4. Shows bonus amount in notification

## Current Bonus Rates

Can be viewed/adjusted in Supabase:
```sql
SELECT * FROM bonus_multipliers WHERE is_active = true;
```

| Type | Base | Description |
|------|------|-------------|
| girls_game_base | 0.10 | 10% on girls games |
| girls_streak_3 | 0.05 | +5% for 3+ girls bets |
| girls_streak_7 | 0.10 | +10% for 7+ girls bets |
| boys_game_base | 0.05 | 5% on boys games |
| boys_streak_3 | 0.03 | +3% for 3+ boys bets |
| boys_streak_7 | 0.05 | +5% for 7+ boys bets |
| general_bet_base | 0.02 | 2% on any bet |
| bet_streak_3 | 0.03 | +3% for 3-day streak |
| bet_streak_7 | 0.05 | +5% for 7-day streak |
| weekend_bonus | 0.05 | +5% on Sat/Sun |

## Adjusting Bonuses

### Change Bonus Percentages
```sql
-- Example: Increase girls game base bonus to 15%
UPDATE bonus_multipliers 
SET multiplier = 0.15, updated_at = NOW() 
WHERE bonus_type = 'girls_game_base';
```

### Disable a Bonus
```sql
-- Example: Disable weekend bonus
UPDATE bonus_multipliers 
SET is_active = false, updated_at = NOW() 
WHERE bonus_type = 'weekend_bonus';
```

### Enable Special Events
```sql
-- Example: Enable rivalry week bonus
UPDATE bonus_multipliers 
SET is_active = true, updated_at = NOW() 
WHERE bonus_type = 'rivalry_week';
```

## Troubleshooting

### Bonuses Not Showing?
1. Check migration ran successfully: `SELECT * FROM bonus_multipliers;`
2. Verify backend restarted
3. Check browser console for errors
4. Look for bonus calculation errors in server logs

### Wrong Bonus Amounts?
1. Verify game `team_type` is set correctly (girls/boys/other)
2. Check bonus multipliers in database
3. Ensure function `calculate_game_bonus` exists: `SELECT * FROM pg_proc WHERE proname = 'calculate_game_bonus';`

### Bonuses Not Applied to Winnings?
1. Check `girls_game_bonus` column exists on bets: `\d bets`
2. Verify bet has bonus stored: `SELECT id, girls_game_bonus FROM bets WHERE id = X;`
3. Check game resolution logs in server console

## User Education

Users can learn about bonuses on the **How to Use** page:
- Go to site navigation
- Click "How to Use" or "Help"
- Scroll to "Betting Bonuses & Incentives" section

Shows:
- All bonus tiers with percentages
- Example calculations
- Strategy tips
- Weekend bonus info

## Support

For issues or questions:
1. Check `BETTING_INCENTIVES.md` for full details
2. Review `INCENTIVES_IMPLEMENTATION.md` for technical info
3. Check server logs for calculation errors
4. Verify database function exists and bonus_multipliers table populated

## What Changed

**Backend Files**:
- `server/routes/bets.js` - Applies bonuses to all bets
- `server/routes/propBets.js` - Applies bonuses to prop bets  
- `server/routes/games.js` - Applies bonuses to winnings

**Frontend Files**:
- `client/src/components/HowToUse.js` - Education section
- `client/src/styles/HowToUse.css` - Bonus card styling

**Database**:
- `database/add-general-betting-incentives.sql` - New migration
- Function: `calculate_game_bonus(user_id, team_type)`
- Table: `bonus_multipliers` (6 new rows)

## Rollback

If you need to disable the system:
```sql
-- Disable all bonuses
UPDATE bonus_multipliers SET is_active = false;
```

To fully remove (not recommended):
```sql
-- Remove new bonus types
DELETE FROM bonus_multipliers WHERE bonus_type IN (
  'boys_game_base', 'boys_streak_3', 'boys_streak_7',
  'general_bet_base', 'bet_streak_3', 'bet_streak_7'
);

-- Drop new function
DROP FUNCTION IF EXISTS calculate_game_bonus(UUID, VARCHAR);
```

## Success Indicators

✅ Bonus notifications appear when placing bets  
✅ Different emojis for girls/boys/general (🎀/🏀/⭐)  
✅ Winning bets show bonus amount in notification  
✅ Transaction history shows bonus percentages  
✅ "How to Use" page displays bonus section  
✅ Weekend bets show extra 5% bonus  

Your betting incentives are now live! 🎉
