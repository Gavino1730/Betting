# Betting Incentives System

## Overview
The Valiant Picks platform now features a comprehensive incentive system that rewards users for placing bets. The system has three tiers of bonuses based on game type, with **girls games having the highest bonuses** to encourage support for women's basketball.

## Bonus Tiers

### � Girls Games (BEST BONUSES)
- **Base Bonus**: 10% on all girls game bets
- **3-Game Streak**: +5% additional (15% total)
- **7-Game Streak**: +10% additional (20% total)
- **Maximum Possible**: 20% bonus on girls games

### 🏀 Boys Games (MEDIUM BONUSES)
- **Base Bonus**: 5% on all boys game bets
- **3-Game Streak**: +3% additional (8% total)
- **7-Game Streak**: +5% additional (10% total)
- **Maximum Possible**: 10% bonus on boys games

### ⭐ General Betting (SMALL BONUSES)
- **Base Bonus**: 2% on any bet placed
- **3-Day Streak**: +3% additional (5% total)
- **7-Day Streak**: +5% additional (7% total)
- **Maximum Possible**: 7% bonus on general betting

### 🎉 Weekend Bonus
- **Extra 5%** on ALL bets placed during weekends (Saturday/Sunday)
- Stacks with all other bonuses!

## How Bonuses Work

### When You Place a Bet
1. The system calculates your applicable bonuses based on:
   - The game type (girls/boys/general)
   - Your recent betting streak
   - Day of the week (weekend bonus)
   - Any special events (rivalry week, etc.)

2. Your bet notification will show the total bonus percentage
3. Example: "✅ Bet Placed � +15% Girls Game Bonus!"

### When You Win
1. Your base winnings are calculated: `amount × odds`
2. Bonus is applied: `winnings × (1 + bonus%)`
3. Example with 15% bonus:
   - Base winnings: 100 Bucks × 2.0 odds = 200 Bucks
   - With 15% bonus: 200 + (200 × 0.15) = 230 Bucks
   - **You get 230 Valiant Bucks instead of 200!**

## Streak Bonuses

### Game Type Streaks (Girls/Boys)
- Tracks your last 10 bets
- Counts consecutive bets on the same game type
- Resets when you bet on a different type
- Example: Bet on 7 girls games in a row = 10% streak bonus

### Daily Betting Streaks (All Games)
- Tracks days with at least one bet
- Counts consecutive days of betting
- Any game type counts
- Example: Bet 7 days in a row = 5% daily streak bonus

## Bonus Stacking Examples

### Maximum Girls Game Bonus (Weekend)
- Girls game base: **10%**
- 7-game girls streak: **+10%**
- Weekend bonus: **+5%**
- **Total: 25% bonus!**

### Boys Game with Streaks (Weekend)
- Boys game base: **5%**
- 7-game boys streak: **+5%**
- 7-day betting streak: **+5%**
- Weekend bonus: **+5%**
- **Total: 20% bonus!**

### General Betting (Weekday)
- General base: **2%**
- 7-day betting streak: **+5%**
- **Total: 7% bonus**

## Special Events

### Rivalry Week
- Special **15% bonus** during rivalry weeks
- Applies to all game types
- Activated by admins for special matchups
- Currently disabled (can be enabled for big games)

## Prop Bets
- Prop bets also receive bonuses based on their team type
- Girls props: Up to 20% bonus
- Boys props: Up to 10% bonus
- General props: Up to 7% bonus

## Strategy Tips

1. **Support Girls Basketball**: Get the best bonuses by betting on girls games
2. **Build Streaks**: Consecutive bets multiply your bonuses
3. **Weekend Betting**: Extra 5% every weekend stacks with everything
4. **Mix It Up**: Still get bonuses on boys games and general bets
5. **Daily Bets**: Bet every day to maintain your daily streak bonus

## Technical Details

### Database
- Bonus percentages stored in `bonus_multipliers` table
- Can be adjusted by admins without code changes
- Bonuses stored with each bet in `girls_game_bonus` column (renamed from legacy name)

### Calculation
- Function: `calculate_game_bonus(user_id, team_type)`
- Runs when bet is placed
- Considers all active bonuses
- Returns total bonus percentage as decimal (0.15 = 15%)

### Application
- Bonus stored with bet record
- Applied to winnings when game resolves
- Visible in notifications and transaction history
- Never expires or changes after bet is placed

## Admin Controls

Admins can adjust bonuses in the `bonus_multipliers` table:
- Change bonus percentages
- Enable/disable specific bonuses
- Add special event bonuses
- All changes apply to new bets only

## Migration

To enable this system on your database, run:
```sql
-- In Supabase SQL Editor
\i database/add-general-betting-incentives.sql
```

This adds:
- New bonus multipliers for general and boys games
- Updated `calculate_game_bonus()` function
- Backward compatibility with existing code
