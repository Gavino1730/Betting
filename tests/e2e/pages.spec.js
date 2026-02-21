const { test, expect } = require('@playwright/test');
const {
  loginAsUser, clearSession, navigateTo, dismissAllOverlays,
} = require('../helpers/test-utils');

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAsUser(page);
  });

  const navPages = [
    { label: 'Dashboard', heading: /Dashboard/i },
    { label: 'Place Picks', heading: /Place Your Picks/i },
    { label: 'Teams', heading: /Teams/i },
    { label: 'My Picks', heading: /My Picks|Your Picks/i },
    { label: 'Leaderboard', heading: /Leaderboard/i },
  ];

  for (const { label, heading } of navPages) {
    test(`should navigate to ${label}`, async ({ page }) => {
      await navigateTo(page, label);
      await dismissAllOverlays(page);

      await expect(page.locator(`text=${heading}`).first()).toBeVisible({ timeout: 10000 });
    });
  }
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAsUser(page);
  });

  test('should show user balance on dashboard', async ({ page }) => {
    await navigateTo(page, 'Dashboard');
    await dismissAllOverlays(page);

    // Balance pill is in the navbar
    await expect(page.locator('.balance-amount').first()).toBeVisible();
  });

  test('should display upcoming games section', async ({ page }) => {
    await navigateTo(page, 'Dashboard');
    await dismissAllOverlays(page);

    // Dashboard has game-related content or an empty state
    const hasContent = await page.locator('text=/Upcoming|Games|No upcoming/i').first()
      .isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasContent).toBeTruthy();
  });
});

test.describe('Leaderboard', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAsUser(page);
  });

  test('should display leaderboard rankings', async ({ page }) => {
    await navigateTo(page, 'Leaderboard');
    await dismissAllOverlays(page);

    await expect(page.locator('text=/Leaderboard/i').first()).toBeVisible();

    // Should have table rows or user entries
    const entries = page.locator('table tbody tr, .leaderboard-row, [class*="leaderboard"]');
    const count = await entries.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('My Picks (Bet List)', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAsUser(page);
  });

  test('should display bet history or empty state', async ({ page }) => {
    await navigateTo(page, 'My Picks');
    await dismissAllOverlays(page);

    // Wait for content to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Should show bets or a "no picks" message
    const hasBets = await page.locator('.bet-mobile-card, .bet-table tbody tr').first()
      .isVisible({ timeout: 5000 }).catch(() => false);
    const emptyMsg = await page.locator('.empty-state').first()
      .isVisible({ timeout: 2000 }).catch(() => false);
    const hasHeader = await page.locator('h1:has-text("My Picks")').first()
      .isVisible({ timeout: 2000 }).catch(() => false);

    expect(hasBets || emptyMsg || hasHeader).toBeTruthy();
  });

  test('should have filter tabs', async ({ page }) => {
    await navigateTo(page, 'My Picks');
    await dismissAllOverlays(page);

    // BetList uses .tab-button class for filter tabs
    const filterBtns = page.locator('.tab-button');
    await page.waitForTimeout(2000);
    const count = await filterBtns.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Teams', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAsUser(page);
  });

  test('should display teams page', async ({ page }) => {
    await navigateTo(page, 'Teams');
    await dismissAllOverlays(page);

    await expect(page.locator('text=/Teams/i').first()).toBeVisible();
  });
});
