# Enhanced Rewards & Girls Game Incentives - Implementation Guide

## Overview
This update adds a comprehensive rewards system focused on incentivizing betting activity, especially on girls basketball games. Users can earn bonuses, achievements, and participate in weekly competitions.

## 🎀 Girls Game Bonus System

### How It Works
- **Base Bonus**: +10% on all girls game bets
- **Streak Bonus 3**: Additional +5% for 3+ consecutive girls game bets
- **Streak Bonus 7**: Additional +10% for 7+ consecutive girls game bets  
- **Weekend Bonus**: Extra +5% on weekend bets
- **Maximum Bonus**: Up to 25% extra winnings!

### Example
User bets 100 Valiant Bucks on a girls game with medium confidence (1.5x):
- Base payout: 150 VB
- With girls bonus (15% for 3-game streak): 172.5 VB
- Weekend bonus: 180 VB

## 🏆 New Achievements

### Girls Game Achievements
- **Girls Supporter** 🎀 - Bet on 5 girls games (Reward: 150 VB)
- **Girls Champion** 👑 - Bet on 20 girls games (Reward: 300 VB)
- **Girls Legend** 🏆 - Bet on 50 girls games (Reward: 500 VB)
- **Girls Streak 3** 💖 - 3 consecutive girls game bets (Reward: 100 VB)
- **Girls Streak 7** 💝 - 7 consecutive girls game bets (Reward: 250 VB)
- **Girls All Today** 🌟 - Bet on all girls games in one day (Reward: 200 VB)

### Betting Engagement Achievements
- **Bet Streak 3** 📈 - 3 days betting streak (Reward: 75 VB)
- **Bet Streak 7** 🚀 - 7 days betting streak (Reward: 200 VB)
- **Bet Streak 30** 🌠 - 30 days betting streak (Reward: 1000 VB)
- **High Roller** 🎲 - 10 bets in one day (Reward: 300 VB)
- **Perfect Week** ✨ - Win all bets for a week (Reward: 500 VB)
- **Comeback Kid** 💪 - Win after losing 5 in a row (Reward: 150 VB)

### Milestone Achievements
- **Bets 10/50/100/500** - Total bets placed (Rewards: 100/300/750/2000 VB)
- **Wins 10/50/100** - Total bets won (Rewards: 150/500/1000 VB)

## 📊 Weekly Leaderboard Bonuses

### How It Works
Every week, top performers receive bonus payouts:
- **#1**: 1000 VB
- **#2-3**: 500 VB each
- **#4-10**: 250 VB each

### Extra Bonus for Girls Game Support
- Bet on 5+ girls games: +200 VB
- Bet on 3+ girls games: +100 VB

### Requirements
- Minimum 3 bets placed during the week
- Based on total winnings

## 👥 Referral System

### How It Works
1. Share your unique referral code with friends
2. New user signs up with your code
3. They get: **50 VB welcome bonus** immediately
4. You get: **100 VB** when they place their first bet

### Features
- Track your referrals and earnings
- No limit on referrals
- Bonuses auto-credited

## 🚀 Setup Instructions

### 1. Database Migration
Run this SQL in Supabase SQL Editor:

```bash
# Navigate to database folder
cd database

# Run the migration
psql $DATABASE_URL < enhanced-rewards-migration.sql
```

Or copy contents of `database/enhanced-rewards-migration.sql` and run in Supabase SQL Editor.

### 2. Backend Changes
All backend changes are already implemented:
- ✅ New achievement types in `Achievement.js`
- ✅ Girls game bonus calculation in bet placement
- ✅ Bonus applied to winnings during bet resolution
- ✅ New API routes: `/api/periodic-bonuses`, `/api/referrals`
- ✅ Routes registered in `server.js`

### 3. Frontend Changes
- ✅ Girls game bonus display in bet slip
- ✅ Promotional banner on games page
- ✅ Updated achievement icons
- ✅ Styling for bonus indicators

### 4. Admin Tasks

#### Award Weekly Bonuses (Manual)
Run this API call every week:

```bash
POST /api/periodic-bonuses/award-weekly
Authorization: Bearer <admin-token>
```

Or setup a cron job in Railway:
```bash
# Add to scheduler.js
schedule.scheduleJob('0 0 * * 0', async () => {
  // Award weekly bonuses
  // Call award_weekly_bonuses() function
});
```

#### Configure Bonus Multipliers
```bash
PUT /api/periodic-bonuses/multipliers/girls_game_base
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "multiplier": 0.15,  // Change to 15%
  "is_active": true
}
```

## 📱 User Experience

### On Games Page
1. Prominent banner shows girls game bonuses
2. Game cards highlighted for girls games
3. Bet slip shows bonus calculation
4. Notifications include bonus information

### Achievements
- Pop-up when achievements are unlocked
- Claim rewards immediately
- Track progress toward milestones

### Referrals
- Access referral code from dashboard/profile
- Share with friends
- Track referrals and earnings

## 🔧 Configuration Options

### Bonus Multipliers (Database Table)
Adjust in `bonus_multipliers` table:
- `girls_game_base`: Base girls game bonus (default: 0.10 = 10%)
- `girls_streak_3`: 3-game streak bonus (default: 0.05 = 5%)
- `girls_streak_7`: 7-game streak bonus (default: 0.10 = 10%)
- `weekend_bonus`: Weekend extra bonus (default: 0.05 = 5%)
- `rivalry_week`: Special event bonus (default: 0.15 = 15%, inactive)

### Achievement Rewards
Edit values in `server/models/Achievement.js` TYPES object.

### Referral Rewards
Edit values in `server/routes/referrals.js`:
- `referrer_reward`: Reward for referrer (default: 100)
- `referred_reward`: Reward for new user (default: 50)

## 📈 Expected Impact

### Increased Girls Game Betting
- Visible bonuses incentivize participation
- Streak system encourages consecutive betting
- Special achievements reward loyalty

### Higher Engagement
- Weekly competitions create ongoing goals
- Milestones provide long-term progression
- Referrals expand user base

### User Retention
- Daily achievements keep users coming back
- Bonus multipliers reward active users
- Leaderboard creates competitive atmosphere

## 🐛 Testing Checklist

- [ ] Run database migration successfully
- [ ] Place bet on girls game - verify bonus applied
- [ ] Win girls game bet - verify bonus added to payout
- [ ] Check achievements unlock after girls game bets
- [ ] Test referral code generation
- [ ] Test referral signup with code
- [ ] Test first bet completes referral
- [ ] Admin award weekly bonuses
- [ ] Claim periodic bonus
- [ ] View bonus multipliers

## 📝 Notes

- Bonuses calculated server-side for security
- All bonus logic is in database functions
- Frontend displays approximate bonuses
- Actual bonus calculated at bet placement
- Admin can adjust multipliers without code changes

## 🚨 Important

1. **Run the migration** before deploying code
2. **Test in staging** environment first
3. **Backup database** before migration
4. **Update client** if backend is already deployed
5. **Monitor** for any errors in first week

## Support

If you encounter issues:
1. Check database migration ran successfully
2. Verify all new routes are registered
3. Check browser console for errors
4. Review server logs for backend issues
5. Test with simple girls game bet first

---

## Quick Start Commands

```bash
# 1. Run migration
# Copy database/enhanced-rewards-migration.sql to Supabase SQL Editor and execute

# 2. Install any new dependencies (if needed)
cd server && npm install

# 3. Restart server
npm run dev

# 4. Test girls game bonus
# Place a bet on a girls basketball game and verify bonus appears

# 5. Award weekly bonuses (admin only)
curl -X POST https://valiantpicks.com/api/periodic-bonuses/award-weekly \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Future Enhancements

- Automated weekly bonus distribution
- Monthly championships
- Season-long competitions
- Team-specific achievements
- Social sharing for referrals
- Achievement progress bars
- Bonus history tracking
- Leaderboard filtering by achievements
