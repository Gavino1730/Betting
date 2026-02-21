const { expect } = require('@playwright/test');

// ── Credentials from .env.test ─────────────────────────────────────────────
const TEST_USER = {
  username: process.env.TEST_USER_USERNAME || 'testuser',
  email: process.env.TEST_USER_EMAIL || 'testuser@valiantpicks.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
};

const TEST_ADMIN = {
  username: process.env.TEST_ADMIN_USERNAME || 'testadmin',
  email: process.env.TEST_ADMIN_EMAIL || 'admin@valiantpicks.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'AdminPassword123!',
};

// ── Dismiss ALL overlays (onboarding, spin-wheel, daily-reward) ────────────
// The app shows popups after login: OnboardingModal, DailyReward, SpinWheel.
// These overlays intercept pointer events, so we must dismiss them first.
async function dismissAllOverlays(page) {
  // Give popups time to render (they use a queue with delays)
  await page.waitForTimeout(1500);

  // Keep dismissing for up to 3 passes (popups appear sequentially via queue)
  for (let pass = 0; pass < 4; pass++) {
    let dismissed = false;

    // Spin Wheel overlay
    const spinClose = page.locator('.spin-wheel-close');
    if (await spinClose.isVisible({ timeout: 800 }).catch(() => false)) {
      await spinClose.click({ force: true });
      dismissed = true;
      await page.waitForTimeout(500);
    }

    // Spin Wheel overlay click-to-close
    const spinOverlay = page.locator('.spin-wheel-overlay');
    if (await spinOverlay.isVisible({ timeout: 300 }).catch(() => false)) {
      await spinOverlay.click({ position: { x: 5, y: 5 }, force: true });
      dismissed = true;
      await page.waitForTimeout(500);
    }

    // Daily Reward modal
    const dailyClose = page.locator('.daily-reward-close, .daily-reward-overlay button:has-text("Close")').first();
    if (await dailyClose.isVisible({ timeout: 300 }).catch(() => false)) {
      await dailyClose.click({ force: true });
      dismissed = true;
      await page.waitForTimeout(500);
    }

    // Daily Reward overlay click-to-close
    const dailyOverlay = page.locator('.daily-reward-overlay');
    if (await dailyOverlay.isVisible({ timeout: 300 }).catch(() => false)) {
      await dailyOverlay.click({ position: { x: 5, y: 5 }, force: true });
      dismissed = true;
      await page.waitForTimeout(500);
    }

    // Onboarding modal
    const onboardingClose = page.locator('[data-testid="onboarding-close"], .onboarding-close').first();
    if (await onboardingClose.isVisible({ timeout: 300 }).catch(() => false)) {
      await onboardingClose.click({ force: true });
      dismissed = true;
      await page.waitForTimeout(500);
    }

    // "Let's Get Started" button on onboarding
    const letsGo = page.locator('[data-testid="onboarding-start"]');
    if (await letsGo.isVisible({ timeout: 300 }).catch(() => false)) {
      await letsGo.click({ force: true });
      dismissed = true;
      await page.waitForTimeout(500);
    }

    if (!dismissed) break;
  }
}

// ── Login ──────────────────────────────────────────────────────────────────
// The app renders the Login component directly when there is no JWT token.
// There is NO "/login" route — the login form IS the landing page.
async function login(page, username, password) {
  await clearSession(page);

  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  // The login form has #username and #password fields
  await page.locator('#username').waitFor({ state: 'visible', timeout: 10000 });

  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');

  // After success the navbar appears
  await page.locator('.navbar').waitFor({ state: 'visible', timeout: 15000 });

  // Dismiss all popups/overlays
  await dismissAllOverlays(page);
}

async function loginAsUser(page) {
  await login(page, TEST_USER.username, TEST_USER.password);
}

async function loginAsAdmin(page) {
  await login(page, TEST_ADMIN.username, TEST_ADMIN.password);
}

// ── Logout ─────────────────────────────────────────────────────────────────
async function logout(page) {
  // Dismiss any lingering overlays first
  await dismissAllOverlays(page);

  // Desktop: button.logout-btn in the navbar
  const logoutBtn = page.locator('button.logout-btn');
  if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutBtn.click({ force: true });
  } else {
    // Mobile: open the user menu
    const userTrigger = page.locator('.nav-user-trigger');
    if (await userTrigger.isVisible({ timeout: 2000 }).catch(() => false)) {
      await userTrigger.click({ force: true });
      await page.locator('.nav-user-menu button:has-text("Logout")').click({ force: true });
    } else {
      // Mobile hamburger menu logout
      const mobileToggle = page.locator('.mobile-menu-toggle');
      if (await mobileToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
        await mobileToggle.click({ force: true });
        await page.locator('.mobile-logout-btn').click({ force: true });
      } else {
        // Fallback: just clear session
        await clearSession(page);
        await page.goto('/');
        return;
      }
    }
  }

  // After logout the login form should reappear
  await page.locator('#username').waitFor({ state: 'visible', timeout: 10000 });
}

// ── Register ───────────────────────────────────────────────────────────────
async function register(page, username, email, password) {
  await clearSession(page);
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  // Wait for login form
  await page.locator('#username').waitFor({ state: 'visible', timeout: 10000 });

  // Switch to registration mode
  await page.locator('button.toggle-link-btn:has-text("Create Account")').click();
  await page.locator('#email').waitFor({ state: 'visible', timeout: 5000 });

  await page.fill('#username', username);
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
}

// ── Session clearing ───────────────────────────────────────────────────────
async function clearSession(page) {
  await page.context().clearCookies();
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch {
    // No page loaded yet
  }
}

// ── Navigation ─────────────────────────────────────────────────────────────
async function navigateTo(page, label) {
  // Dismiss overlays before navigating
  await dismissAllOverlays(page);

  // Desktop nav: <button class="nav-link">
  const navLink = page.locator(`.nav-link:has-text("${label}")`);
  if (await navLink.isVisible({ timeout: 2000 }).catch(() => false)) {
    await navLink.click({ force: true });
  } else {
    // Mobile: hamburger → slide-out menu
    const mobileToggle = page.locator('.mobile-menu-toggle');
    if (await mobileToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      await mobileToggle.click({ force: true });
      await page.locator('.mobile-menu.open').waitFor({ state: 'visible', timeout: 3000 });
      await page.locator(`.mobile-menu-nav button:has-text("${label}")`).click({ force: true });
    }
  }
  await page.waitForLoadState('domcontentloaded');
  await dismissAllOverlays(page);
}

// ── Admin tab navigation ───────────────────────────────────────────────────
async function navigateToAdminTab(page, tabLabel) {
  await page.goto('/admin');
  await page.waitForLoadState('domcontentloaded');
  await dismissAllOverlays(page);

  const tab = page.locator(`.tab-btn:has-text("${tabLabel}"), .mobile-admin-pill:has-text("${tabLabel}")`).first();
  if (await tab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await tab.click({ force: true });
    await page.waitForTimeout(500);
  }
}

// ── Balance ────────────────────────────────────────────────────────────────
async function getBalance(page) {
  const balanceEl = page.locator('.balance-amount').first();
  const text = await balanceEl.textContent({ timeout: 5000 });
  return parseFloat(text.replace(/[$,]/g, '')) || 0;
}

// ── Unique test data ───────────────────────────────────────────────────────
function generateTestData() {
  const ts = Date.now();
  const rand = Math.floor(Math.random() * 10000);
  return {
    username: `pw_${ts}_${rand}`,
    email: `pw_${ts}_${rand}@test.valiantpicks.com`,
    password: `PwTest${ts}!`,
  };
}

module.exports = {
  TEST_USER,
  TEST_ADMIN,
  login,
  loginAsUser,
  loginAsAdmin,
  logout,
  register,
  clearSession,
  navigateTo,
  navigateToAdminTab,
  getBalance,
  generateTestData,
  dismissAllOverlays,
};
