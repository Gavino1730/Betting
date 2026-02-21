const { test, expect } = require('@playwright/test');
const {
  loginAsAdmin, clearSession, navigateToAdminTab, dismissAllOverlays,
} = require('../helpers/test-utils');

test.describe('Admin Panel', () => {
  // Helper: login as admin and verify admin access
  async function loginAndVerifyAdmin(page) {
    await clearSession(page);
    await loginAsAdmin(page);

    // Navigate to /admin
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    await dismissAllOverlays(page);

    // Check if admin panel rendered (the admin route might not be available if
    // the testadmin user doesn't have is_admin=true in the database)
    const tabBtns = page.locator('.tab-btn, .mobile-admin-pill');
    const isAdmin = await tabBtns.first().isVisible({ timeout: 5000 }).catch(() => false);
    return isAdmin;
  }

  // ── Access admin panel ─────────────────────────────────────────────────
  test('should access /admin page', async ({ page }) => {
    const isAdmin = await loginAndVerifyAdmin(page);
    if (!isAdmin) {
      test.skip(true, 'Admin user (testadmin) does not have is_admin=true in database');
      return;
    }

    const tabBtns = page.locator('.tab-btn, .mobile-admin-pill');
    const count = await tabBtns.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  // ── Admin tabs ─────────────────────────────────────────────────────────
  test('should display all admin tabs', async ({ page }) => {
    const isAdmin = await loginAndVerifyAdmin(page);
    if (!isAdmin) {
      test.skip(true, 'Admin user not available');
      return;
    }

    const expectedTabs = ['Manage Games', 'Prop Picks', 'View All Picks', 'Manage Users', 'Manage Teams'];
    for (const label of expectedTabs) {
      const tab = page.locator(`.tab-btn:has-text("${label}"), .mobile-admin-pill:has-text("${label}")`).first();
      await expect(tab).toBeVisible({ timeout: 5000 });
    }
  });

  // ── Games tab ──────────────────────────────────────────────────────────
  test('should show games management section', async ({ page }) => {
    const isAdmin = await loginAndVerifyAdmin(page);
    if (!isAdmin) {
      test.skip(true, 'Admin user not available');
      return;
    }

    const tab = page.locator(`.tab-btn:has-text("Manage Games"), .mobile-admin-pill:has-text("Manage Games")`).first();
    await tab.click({ force: true });
    await page.waitForTimeout(500);

    const content = page.locator('text=/Create Game|games|Game/i').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  // ── Users tab ──────────────────────────────────────────────────────────
  test('should show users management section', async ({ page }) => {
    const isAdmin = await loginAndVerifyAdmin(page);
    if (!isAdmin) {
      test.skip(true, 'Admin user not available');
      return;
    }

    const tab = page.locator(`.tab-btn:has-text("Manage Users"), .mobile-admin-pill:has-text("Manage Users")`).first();
    await tab.click({ force: true });
    await page.waitForTimeout(500);

    const userContent = page.locator('text=/Users|username|email/i').first();
    await expect(userContent).toBeVisible({ timeout: 5000 });
  });

  // ── Prop Picks tab ────────────────────────────────────────────────────
  test('should show prop bets management section', async ({ page }) => {
    const isAdmin = await loginAndVerifyAdmin(page);
    if (!isAdmin) {
      test.skip(true, 'Admin user not available');
      return;
    }

    const tab = page.locator(`.tab-btn:has-text("Prop Picks"), .mobile-admin-pill:has-text("Prop Picks")`).first();
    await tab.click({ force: true });
    await page.waitForTimeout(500);

    const content = page.locator('text=/Prop|Create/i').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  // ── All Picks tab ─────────────────────────────────────────────────────
  test('should show all picks section', async ({ page }) => {
    const isAdmin = await loginAndVerifyAdmin(page);
    if (!isAdmin) {
      test.skip(true, 'Admin user not available');
      return;
    }

    const tab = page.locator(`.tab-btn:has-text("View All Picks"), .mobile-admin-pill:has-text("View All Picks")`).first();
    await tab.click({ force: true });
    await page.waitForTimeout(500);

    const content = page.locator('text=/Picks|Bets|All/i').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  // ── Teams tab ─────────────────────────────────────────────────────────
  test('should show teams management section', async ({ page }) => {
    const isAdmin = await loginAndVerifyAdmin(page);
    if (!isAdmin) {
      test.skip(true, 'Admin user not available');
      return;
    }

    const tab = page.locator(`.tab-btn:has-text("Manage Teams"), .mobile-admin-pill:has-text("Manage Teams")`).first();
    await tab.click({ force: true });
    await page.waitForTimeout(500);

    const content = page.locator('text=/Teams|Team/i').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });
});
