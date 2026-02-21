const { test, expect } = require('@playwright/test');
const {
  login, loginAsUser, logout, register, clearSession,
  generateTestData, dismissAllOverlays, TEST_USER,
} = require('../helpers/test-utils');

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  // ── Landing page ───────────────────────────────────────────────────────
  test('should show the login form on first visit', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Brand name
    await expect(page.locator('text=Valiant Picks').first()).toBeVisible();

    // Login form fields
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  // ── Invalid credentials ────────────────────────────────────────────────
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await page.fill('#username', 'nonexistent_user_xyz');
    await page.fill('#password', 'WrongPassword999!');
    await page.click('button[type="submit"]');

    // The Login component shows .alert-error
    await expect(page.locator('.alert-error')).toBeVisible({ timeout: 10000 });
  });

  // ── Successful login ──────────────────────────────────────────────────
  test('should login with valid credentials', async ({ page }) => {
    await loginAsUser(page);

    // Navbar should be visible with the user's username
    await expect(page.locator('.navbar')).toBeVisible();

    // Balance pill should show
    await expect(page.locator('.balance-amount').first()).toBeVisible();
  });

  // ── Logout ─────────────────────────────────────────────────────────────
  test('should logout successfully', async ({ page }) => {
    await loginAsUser(page);
    await logout(page);

    // Login form is back
    await expect(page.locator('#username')).toBeVisible();
  });

  // ── Session persistence ────────────────────────────────────────────────
  test('should persist session after page reload', async ({ page }) => {
    await loginAsUser(page);

    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await dismissAllOverlays(page);

    // Still logged in — navbar visible
    await expect(page.locator('.navbar')).toBeVisible();
    await expect(page.locator('.balance-amount').first()).toBeVisible();
  });

  // ── Registration form toggle ──────────────────────────────────────────
  test('should toggle to registration form', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Click "Create Account"
    await page.locator('button.toggle-link-btn:has-text("Create Account")').click();

    // Email field should now be visible
    await expect(page.locator('#email')).toBeVisible();

    // Header should say "Create Account"
    await expect(page.locator('h1:has-text("Create Account")')).toBeVisible();
  });

  // ── Registration with duplicate username ──────────────────────────────
  test('should show error for duplicate registration', async ({ page }) => {
    await register(page, TEST_USER.username, TEST_USER.email, TEST_USER.password);

    // Should show an error about existing user
    await expect(page.locator('.alert-error')).toBeVisible({ timeout: 10000 });
  });

  // ── Unauthenticated redirect ──────────────────────────────────────────
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Without a token the app renders the login component
    await expect(page.locator('#username')).toBeVisible({ timeout: 10000 });
  });
});
