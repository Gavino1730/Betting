const { test, expect } = require('@playwright/test');
const {
  loginAsUser, clearSession, navigateTo, dismissAllOverlays,
} = require('../helpers/test-utils');

test.describe('Games & Betting', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAsUser(page);
  });

  // ── Navigate to Place Picks ────────────────────────────────────────────
  test('should navigate to the Place Picks page', async ({ page }) => {
    await navigateTo(page, 'Place Picks');

    await expect(page.locator('h2:has-text("Place Your Picks")')).toBeVisible();
  });

  // ── Games list or empty state ─────────────────────────────────────────
  test('should display games or empty state', async ({ page }) => {
    await page.goto('/games');
    await page.waitForLoadState('domcontentloaded');
    await dismissAllOverlays(page);

    // Either game cards are rendered or an empty-state message
    const gameCards = page.locator('.game-card-btn');
    const emptyState = page.locator('.empty-state');

    const cardsCount = await gameCards.count();
    const emptyVisible = await emptyState.isVisible({ timeout: 5000 }).catch(() => false);

    expect(cardsCount > 0 || emptyVisible).toBeTruthy();
  });

  // ── Game card structure ───────────────────────────────────────────────
  test('should show team matchup info on game cards', async ({ page }) => {
    await page.goto('/games');
    await page.waitForLoadState('domcontentloaded');
    await dismissAllOverlays(page);

    const firstCard = page.locator('.game-card-btn').first();
    const hasCards = await firstCard.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasCards) {
      // Should contain "vs" divider
      await expect(firstCard.locator('.game-card-vs')).toBeVisible();
      // Should have at least one team name
      await expect(firstCard.locator('.team-name-text').first()).toBeVisible();
    }
  });

  // ── Team filter buttons ───────────────────────────────────────────────
  test('should have filter buttons (All / Boys / Girls)', async ({ page }) => {
    await page.goto('/games');
    await page.waitForLoadState('domcontentloaded');
    await dismissAllOverlays(page);

    await expect(page.locator('.filter-btn:has-text("All")')).toBeVisible();
    await expect(page.locator('.filter-btn:has-text("Boys")')).toBeVisible();
    await expect(page.locator('.filter-btn:has-text("Girls")')).toBeVisible();
  });

  // ── Clicking a game card opens the pick form ─────────────────────────
  test('should open pick form when clicking an unlocked game', async ({ page }) => {
    await page.goto('/games');
    await page.waitForLoadState('domcontentloaded');
    await dismissAllOverlays(page);

    const unlockedCard = page.locator('.game-card-btn:not(.locked)').first();
    const hasUnlocked = await unlockedCard.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasUnlocked) {
      await unlockedCard.click();

      // The pick form panel should now be visible with team selection buttons
      const teamBtn = page.locator('.team-btn').first();
      await expect(teamBtn).toBeVisible({ timeout: 5000 });
    }
  });

  // ── Confidence buttons ────────────────────────────────────────────────
  test('should show confidence buttons (Low, Medium, High)', async ({ page }) => {
    await page.goto('/games');
    await page.waitForLoadState('domcontentloaded');
    await dismissAllOverlays(page);

    const unlockedCard = page.locator('.game-card-btn:not(.locked)').first();
    const hasUnlocked = await unlockedCard.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasUnlocked) {
      await unlockedCard.click();

      await expect(page.locator('.confidence-btn.low')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.confidence-btn.medium')).toBeVisible();
      await expect(page.locator('.confidence-btn.high')).toBeVisible();
    }
  });

  // ── Prop bets section ─────────────────────────────────────────────────
  test('should display prop-bets section when available', async ({ page }) => {
    await page.goto('/games');
    await page.waitForLoadState('domcontentloaded');
    await dismissAllOverlays(page);

    const propSection = page.locator('.prop-picks-section');
    const hasPropBets = await propSection.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasPropBets) {
      // Should have at least one prop card
      await expect(page.locator('.prop-card').first()).toBeVisible();
    }
    // If no prop bets exist the section is hidden — that's fine
  });
});
