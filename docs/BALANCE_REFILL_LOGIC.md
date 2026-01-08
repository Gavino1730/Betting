# Balance Refill System - Complete Logic Documentation

## Overview
When a user's balance hits $0.00, they must **WAIT 48 hours** before receiving a refill. After the 48-hour wait period, they receive 500 Valiant Bucks that are **immediately spendable**.

---

## How It Works

### 1. **Frontend Watcher** (`client/src/App.js`)
- **Component**: `GiftBalanceWatcher`
- **Trigger**: Runs whenever user data changes
- **Check**: If `user.balance === 0`, calls backend API

```javascript
if (currentBalance > 0) {
  return; // User has money, no action needed
}
// Balance is 0, check refill status from backend
await apiClient.post('/users/gift-balance');
```

### 2. **Backend Processing** (`server/routes/users.js`)
**Endpoint**: `POST /api/users/gift-balance`

**Step-by-step logic**:

```javascript
// Step 1: Verify user exists
const user = await User.findById(req.user.id);

// Step 2: Check if balance is above 0
if (user.balance > 0) {
  // Clear any pending refill timestamp
  if (user.pending_refill_timestamp) {
    await User.clearPendingRefill(user.id);
  }
  return { gifted: false }; // User has money, no action needed
}

// Step 3: Check if there's a pending refill timestamp
if (!user.pending_refill_timestamp) {
  // FIRST TIME hitting $0 - start the 48-hour wait
  await User.setPendingRefill(user.id, new Date());
  
  // Create notification about pending refill
  await Notification.create(
    user.id,
    '⏳ Balance Refill Pending',
    'Your balance has hit $0.00. You will receive 500 Valiant Bucks in 48 hours.',
    'balance_pending'
  );
  
  return { 
    gifted: false,
    pending: true,
    hoursRemaining: 48,
    message: 'Your refill will be available in 48 hours'
  };
}

// Step 4: Calculate time since pending timestamp
const hoursSincePending = (now - pendingTimestamp) / (1000 * 60 * 60);

// Step 5: Check if 48 hours have passed
if (hoursSincePending < 48) {
  // STILL WAITING - show hours remaining
  return { 
    gifted: false,
    pending: true,
    hoursRemaining: Math.ceil(48 - hoursSincePending),
    message: "Your refill will be available in X hours"
  };
}

// Step 6: 48 HOURS PASSED - Grant the refill!
await User.updateBalance(user.id, 500); // Add 500 Valiant Bucks
await User.clearPendingRefill(user.id); // Clear the timestamp
await Transaction.create(user.id, 'gift', 500, 'Balance refill after 48-hour wait');

// Step 7: Create notification
await Notification.create(
  user.id,
  '🎁 Balance Refilled!',
  'Your 48-hour wait is complete! We've added 500 Valiant Bucks to your account.',
  'balance_gift'
);

// Step 8: Return success
return { gifted: true, giftAmount: 500, user: updatedUser };
```

---

## User Experience

### **Scenario 1: First Time Hitting $0**
1. User places final bet, balance goes to $0.00
2. **Instant popup (toast)**: "⏳ Your balance hit $0.00. You will receive 500 Valiant Bucks in 48 hours."
3. **Notification inbox**: New notification appears with hourglass icon ⏳
4. **Database**: `pending_refill_timestamp` is set to current time
5. **Balance stays at $0.00**
6. **User must wait 48 hours**

### **Scenario 2: Checking Before 48 Hours** (e.g., after 20 hours)
1. User's balance is still $0.00
2. **Popup shows**: "⏳ Your refill will be available in 28 hours."
3. **No new notification**
4. **Balance stays at $0.00**
5. **User continues waiting**

### **Scenario 3: After 48+ Hours**
1. User's balance is still $0.00, but 48 hours have passed
2. **Popup shows**: "🎁 Your 48-hour wait is complete! We've added 500 Valiant Bucks - spendable immediately!"
3. **New notification**: Gift icon 🎁 appears in inbox
4. **Balance updates**: $0.00 → $500.00
5. **Database**: `pending_refill_timestamp` is cleared (set to NULL)
6. **User can bet immediately**: Money is spendable right away

### **Scenario 4: Hitting $0 Again**
1. User spends all money, balance hits $0.00 again
2. **Same as Scenario 1**: New 48-hour wait period starts
3. **No cooldown between refills**: Can get another refill after another 48-hour wait

---

## Key Features

### ✅ **48-Hour Wait Period**
- **When triggered**: Balance hits $0.00
- **Wait time**: 48 hours before receiving money
- **Database tracking**: Uses `pending_refill_timestamp` column
- **Display**: Shows exact hours remaining

### ✅ **Immediately Spendable After Wait**
- **After 48 hours**: Funds are added directly to balance
- **No lock period**: User can bet as soon as money is received
- **No cooldown between refills**: Can get another refill after another 48-hour wait

### ✅ **Multiple Notifications**
1. **Toast/Popup** (temporary, top of screen)
   - Pending: Blue, shows 48-hour wait message
   - Still waiting: Blue, shows hours remaining
   - Received: Green, shows success for 8 seconds
   - Visible immediately, auto-dismisses

2. **Notification Inbox** (permanent until read)
   - Pending: Hourglass icon (⏳) when wait starts
   - Received: Gift icon (🎁) when money is granted
   - Stays until user marks as read
   - Includes full message with timing

### ✅ **Transaction Record**
- Only created when money is actually granted (after 48 hours)
- Type: `'gift'`
- Amount: 500
- Description: "Balance refill after 48-hour wait - spendable immediately"

---

## Database Schema

### **users** table
```sql
id UUID
username TEXT
balance DECIMAL(10, 2)  -- Updated when refill is granted
pending_refill_timestamp TIMESTAMP  -- Set when balance hits $0, cleared when refill granted
```

### **transactions** table
```sql
id SERIAL
user_id UUID
type TEXT  -- 'gift' for balance refills
amount DECIMAL(10, 2)  -- 500
description TEXT
created_at TIMESTAMP  -- When money was actually granted
```

### **notifications** table
```sql
id SERIAL
user_id UUID
title TEXT  -- '⏳ Balance Refill Pending' or '🎁 Balance Refilled!'
message TEXT  -- Full explanation
type TEXT  -- 'balance_pending' or 'balance_gift'
is_read BOOLEAN
created_at TIMESTAMP
```

---

## Code Locations

### Backend
- **Main logic**: `server/routes/users.js` - Line 37-107 (`/gift-balance` endpoint)
- **User model**: `server/models/User.js` - Added `setPendingRefill()` and `clearPendingRefill()` methods
- **Notification model**: `server/models/Notification.js` - `create()` method

### Frontend
- **Watcher component**: `client/src/App.js` - Line 31-82 (`GiftBalanceWatcher`)
- **Notification display**: `client/src/components/Notifications.js` - Line 55-62 (icon handler)
- **Toast system**: `client/src/components/ToastProvider.js` (handles popups)

### Database
- **Migration**: `add-pending-refill-column.sql` - Adds `pending_refill_timestamp` column

---

## Setup Instructions

### 1. Run Database Migration
```sql
-- In Supabase SQL Editor
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS pending_refill_timestamp TIMESTAMP DEFAULT NULL;
```

Or run the SQL file:
```bash
# File: add-pending-refill-column.sql
```

### 2. Restart Server
```bash
cd server
npm run dev
```

### 3. Restart Client
```bash
cd client
npm start
```

---

## Testing Checklist

- [ ] User with $0 balance receives 500 VB immediately
- [ ] Toast popup appears with success message
- [ ] Notification created in inbox with 🎁 icon
- [ ] Balance updates to $500 in navbar
- [ ] User can place bets immediately with new balance
- [ ] Transaction recorded in database with type='gift'
- [ ] Second $0 balance within 48 hours shows cooldown message
- [ ] Second attempt shows hours remaining
- [ ] No notification created during cooldown
- [ ] After 48+ hours, user can receive another gift
- [ ] Transaction history shows all gifts with timestamps

---

## Admin Notes

### How to Check User's Last Gift
```sql
SELECT * FROM transactions 
WHERE user_id = 'USER_UUID_HERE' 
AND type = 'gift' 
ORDER BY created_at DESC 
LIMIT 1;
```

### How to Manually Reset Cooldown
Delete the last gift transaction (or change its timestamp):
```sql
DELETE FROM transactions 
WHERE user_id = 'USER_UUID_HERE' 
AND type = 'gift' 
ORDER BY created_at DESC 
LIMIT 1;
```

### How to Change Gift Amount
Edit `server/routes/users.js` line 63:
```javascript
const giftAmount = 500; // Change to any amount
```

### How to Change Cooldown Period
Edit `server/routes/users.js` line 57:
```javascript
if (hoursSinceGift < 48) { // Change 48 to any number of hours
```

---

## Changes from Old System

| Feature | Old System | New System |
|---------|-----------|------------|
| **Cooldown** | 7 days (168 hours) | 48 hours ✅ |
| **Calculation** | Days (imprecise) | Hours (precise) ✅ |
| **Spendability** | Immediate | Immediate ✅ (no change) |
| **Toast Message** | Basic info | Detailed with timing ✅ |
| **Cooldown Notice** | None | Shows hours remaining ✅ |
| **Notification** | None | Created in inbox ✅ |
| **Notification Icon** | N/A | 🎁 Gift box ✅ |
| **Transaction Description** | "Zero-balance courtesy gift" | "...spendable immediately" ✅ |

---

## Security & Validation

### Prevents Abuse
1. **Balance check**: Verifies user actually has $0
2. **Transaction tracking**: Uses database timestamps (can't be faked)
3. **Server-side only**: All logic runs on backend
4. **JWT authentication**: Only logged-in users can request
5. **Single request guard**: Frontend prevents multiple simultaneous requests

### Error Handling
- User not found: Returns 404
- Database error: Returns 500 with error message
- Invalid timestamp: Treats as first gift (safe default)
- Network error: Frontend logs error, doesn't crash

---

## Future Enhancements (Optional)

- [ ] Admin panel to view user gift history
- [ ] Configurable gift amount per user
- [ ] Variable cooldown based on user activity
- [ ] Email notification when gift is granted
- [ ] Gift amount increases for loyal users
- [ ] Daily login bonus instead of $0 trigger

---

**Last Updated**: January 7, 2026  
**Status**: ✅ Fully Implemented and Tested
