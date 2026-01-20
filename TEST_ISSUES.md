# Test Issues to Fix

**Test Run Date:** January 19, 2026  
**Pass Rate:** 127/142 (89.4%)  
**Status:** 12 failures, 3 skipped

---

## Critical Issues (Likely Production Bugs)

### 1. Games - should display game details
**File:** `tests/e2e/games.spec.js:31-43`  
**Error:** Strict mode violation - `locator('[class*="game"]').first().locator('text=/vs|@/i')` resolved to 2 elements  
**Impact:** High - Game details page fails  
**Root Cause:** Multiple VS elements in game card HTML structure  
**Fix:** Use `.first()` on the VS locator or be more specific with the selector

```javascript
// Current (line 43):
await expect(firstGame.locator('text=/vs|@/i')).toBeVisible();

// Suggested fix:
await expect(firstGame.locator('text=/vs|@/i').first()).toBeVisible();
```

---

### 2. Admin Panel - Navigation tabs hidden
**File:** `tests/e2e/admin.spec.js:18-26`  
**Error:** TimeoutError - `.tabs .tab-btn` elements are hidden (not visible)  
**Impact:** High - Admin navigation unusable  
**Root Cause:** Tabs exist but are hidden by CSS or overlay  
**Fix:** Investigate why admin tabs are hidden on page load

---

### 3. Admin Panel - Teams management section not found
**File:** `tests/e2e/admin.spec.js:230-242`  
**Error:** Element not found - `text=/Create Team|Team Management/i`  
**Impact:** Medium - Teams management page fails to load  
**Root Cause:** Teams link click doesn't navigate properly  
**Fix:** Check if Teams tab navigation works in admin panel

---

### 4. Auth - Login page email input not visible
**File:** `tests/e2e/auth.spec.js:15-26`  
**Error:** Email input not visible after 15s timeout  
**Impact:** Medium - Login page may have rendering issues  
**Root Cause:** Page loads but form elements don't render  
**Fix:** Check if login form is being blocked or hidden

---

### 5. Auth - Logout navigation timeout
**File:** `tests/e2e/auth.spec.js:71-80`  
**Error:** Timeout waiting for navigation to "/" after logout (15s)  
**Impact:** Medium - Logout doesn't redirect properly  
**Root Cause:** Logout click doesn't trigger navigation  
**Fix:** Verify logout handler redirects correctly

---

### 6. Teams - Login verification fails
**Files:** `tests/e2e/teams.spec.js:17`, `tests/e2e/teams.spec.js:38`  
**Error:** Logout button not visible after login (5s timeout)  
**Impact:** Medium - Login helper fails to verify successful login  
**Root Cause:** Login completes but logout button not rendered  
**Fix:** Check if navbar logout button is hidden or delayed on Teams page

---

## Modal/Input Blocking Issues (Likely OnBoarding Related - Deploy First)

### 7. Games - Bet modal not opening
**File:** `tests/e2e/games.spec.js:64-85`  
**Error:** Modal visibility check returns false  
**Impact:** High - Users can't place bets via modal  
**Root Cause:** Game click doesn't trigger modal (likely onboarding blocking)  
**Expected:** Will likely be fixed after onboarding deployment

---

### 8. Games - Medium confidence bet input timeout
**File:** `tests/e2e/games.spec.js:127-140`  
**Error:** Input timeout (10s) waiting for amount field  
**Impact:** High - Can't fill bet amount  
**Root Cause:** Modal doesn't open or input blocked  
**Expected:** Will likely be fixed after onboarding deployment

---

### 9. Games - Zero bet amounts input timeout
**File:** `tests/e2e/games.spec.js:230-244`  
**Error:** Input timeout (60s) waiting for amount field  
**Impact:** Medium - Can't test validation  
**Root Cause:** Modal doesn't open  
**Expected:** Will likely be fixed after onboarding deployment

---

### 10. Games - Bet confirmation input timeout
**File:** `tests/e2e/games.spec.js:254-268`  
**Error:** Input timeout (10s) waiting for amount field  
**Impact:** High - Can't test bet confirmation flow  
**Root Cause:** Modal doesn't open  
**Expected:** Will likely be fixed after onboarding deployment

---

### 11. Rewards - Achievement unlock input timeout
**File:** `tests/e2e/rewards.spec.js:195-209`  
**Error:** Input timeout (10s) waiting for bet amount field  
**Impact:** Medium - Can't test achievement unlock after bet  
**Root Cause:** Bet modal doesn't open  
**Expected:** Will likely be fixed after onboarding deployment

---

## Next Steps

1. **Wait for Cloudflare Pages deployment** (~2-5 minutes)
2. **Run tests again after deployment:**
   ```powershell
   npm run test:chromium
   ```
3. **Expected result:** Issues #7-11 should be fixed (reducing failures to ~2-3)
4. **Remaining work:** Fix issues #1-6 (actual production bugs)

---

## Priority Fixes (After Deployment)

### High Priority
1. **Game details strict mode** (Issue #1) - Easy fix with `.first()`
2. **Bet modal not opening** (Issue #7) - May need additional investigation if not fixed
3. **Admin tabs hidden** (Issue #2) - UI/CSS issue

### Medium Priority
4. **Teams login verification** (Issue #6) - Helper function issue
5. **Logout navigation** (Issue #5) - Redirect logic
6. **Login page rendering** (Issue #4) - Form visibility

### Low Priority (Likely Fixed by Deployment)
7. All input timeout issues (#8-11) - Should resolve with onboarding fix

---

## Test Command
```powershell
# Run all tests
npm run test:chromium

# Run specific test file
npx playwright test tests/e2e/games.spec.js --project=chromium

# Run specific test
npx playwright test tests/e2e/games.spec.js:31 --project=chromium

# Debug mode
npx playwright test --debug
```
