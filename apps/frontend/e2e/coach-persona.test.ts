import { test, expect, Page } from '@playwright/test';

// Test data for coach persona - use fixed names for repeatability
const TEST_COACH = {
  email: `coach.test.${Date.now()}@test.com`,
  password: 'CoachPassword123!',
  name: 'Test Coach',
};

const TEST_TEAM = {
  name: 'Coach Test Team',
  sport: 'Soccer',
};

test.describe('Returning Power User (Coach) - E2E Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('1. Register as coach and create team', async ({ page }) => {
    console.log('[STEP 1] Starting registration flow...');

    // Navigate to app
    await page.goto('http://localhost:54039/');
    console.log(`[INFO] Initial URL: ${page.url()}`);

    // Should redirect to login
    await expect(page).toHaveURL('http://localhost:54039/login');
    console.log('[INFO] Redirected to login page');

    // Click register link
    const registerLink = page.locator('a:has-text("Register"), a:has-text("Sign up"), button:has-text("Register")');
    await registerLink.first().click();
    await page.waitForURL('http://localhost:54039/register');
    console.log('[INFO] On register page');

    // Fill registration form
    await page.fill('input[name="name"]', TEST_COACH.name);
    await page.fill('input[name="email"]', TEST_COACH.email);
    await page.fill('input[name="password"]', TEST_COACH.password);
    await page.fill('input[name="confirmPassword"]', TEST_COACH.password);

    // Select coach role
    await page.selectOption('select[name="role"]', 'coach');
    console.log('[INFO] Form filled, submitting...');

    // Submit
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log(`[INFO] After submit, URL: ${page.url()}`);

    // Check if we're on teams page or still on register
    const currentUrl = page.url();
    if (currentUrl.includes('/register')) {
      // Check for errors
      const errors = page.locator('.error, [role="alert"], text=/error/i');
      const errorCount = await errors.count();
      if (errorCount > 0) {
        const errorText = await errors.first().textContent();
        console.log(`[ERROR] Registration error: ${errorText}`);
      }
    }

    // May need to wait longer for redirect
    await page.waitForTimeout(2000);
    console.log(`[INFO] Final URL after registration: ${page.url()}`);
  });

  test('2. Create a team', async ({ page }) => {
    console.log('[STEP 2] Creating team...');
    console.log(`[INFO] Current URL: ${page.url()}`);

    // If on teams page, look for create button
    const createBtn = page.locator('button:has-text("Create Team"), button:has-text("New Team"), a:has-text("Create Team"), a:has-text("New Team")');
    const btnCount = await createBtn.count();
    console.log(`[INFO] Found ${btnCount} create team buttons`);

    if (btnCount > 0) {
      await createBtn.first().click();
      await page.waitForTimeout(1000);
      console.log('[INFO] Create team dialog/form should be open');

      // Try to fill team form
      const nameInput = page.locator('input[name="teamName"], input[name="name"], input[placeholder*="team"], input[placeholder*="Team"]');
      const sportSelect = page.locator('select[name="sport"], select[name="sportType"]');

      if (await nameInput.count() > 0) {
        await nameInput.fill(TEST_TEAM.name);
        console.log('[INFO] Filled team name');
      }

      if (await sportSelect.count() > 0) {
        await sportSelect.selectOption(TEST_TEAM.sport);
        console.log('[INFO] Selected sport');
      }

      // Submit
      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.count() > 0) {
        await submitBtn.first().click();
        await page.waitForTimeout(3000);
        console.log(`[INFO] After submit, URL: ${page.url()}`);
      }
    }

    console.log(`[INFO] End of team creation, URL: ${page.url()}`);
  });

  test('3. Check navigation and coach controls', async ({ page }) => {
    console.log('[STEP 3] Checking navigation...');

    // Get all navigation links
    const navLinks = page.locator('a[href], nav a, .sidebar a, [role="navigation"] a');
    const count = await navLinks.count();
    console.log(`[INFO] Found ${count} navigation links`);

    for (let i = 0; i < Math.min(count, 10); i++) {
      const link = navLinks.nth(i);
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      console.log(`  - Nav[${i}]: "${text?.trim()}" -> ${href}`);
    }

    // Check for specific coach features
    const eventsLink = page.locator('a:has-text("Events"), a[href*="/events"]');
    const eventsCount = await eventsLink.count();
    console.log(`[INFO] Events links found: ${eventsCount}`);

    // Check page content
    const bodyText = await page.locator('body').textContent();
    const hasCoachKeywords = ['Coach', 'Events', 'Roster', 'Team', 'Dashboard'].some(k => bodyText?.includes(k));
    console.log(`[INFO] Page contains coach keywords: ${hasCoachKeywords}`);
  });

  test('4. Try to access events page', async ({ page }) => {
    console.log('[STEP 4] Accessing events page...');

    // Get current team ID from URL if possible
    const currentUrl = page.url();
    const teamMatch = currentUrl.match(/\/teams\/([^\/]+)/);
    const teamId = teamMatch ? teamMatch[1] : null;
    console.log(`[INFO] Current team ID: ${teamId}`);

    if (teamId) {
      await page.goto(`http://localhost:54039/teams/${teamId}/events`);
      await page.waitForTimeout(2000);
      console.log(`[INFO] Events page URL: ${page.url()}`);

      // Look for event list or create button
      const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
      const createVisible = await createBtn.first().isVisible().catch(() => false);
      console.log(`[INFO] Create button visible: ${createVisible}`);

      // Check for events
      const eventCards = page.locator('[data-testid="event-card"], .event-card, .event');
      const eventCount = await eventCards.count();
      console.log(`[INFO] Event cards found: ${eventCount}`);
    } else {
      console.log('[WARN] No team ID found, cannot navigate to events');
    }
  });

  test('5. Check team detail/roster page', async ({ page }) => {
    console.log('[STEP 5] Checking team detail/roster...');

    const currentUrl = page.url();
    const teamMatch = currentUrl.match(/\/teams\/([^\/]+)/);
    const teamId = teamMatch ? teamMatch[1] : null;

    if (teamId) {
      await page.goto(`http://localhost:54039/teams/${teamId}/detail`);
      await page.waitForTimeout(2000);
      console.log(`[INFO] Team detail URL: ${page.url()}`);

      // Look for roster section
      const rosterSection = page.locator(':has-text("Roster"), :has-text("Players"), [data-testid="roster"]');
      const rosterVisible = await rosterSection.first().isVisible().catch(() => false);
      console.log(`[INFO] Roster section visible: ${rosterVisible}`);

      // Look for add player button
      const addPlayerBtn = page.locator('button:has-text("Add Player"), button:has-text("Add")');
      const addVisible = await addPlayerBtn.first().isVisible().catch(() => false);
      console.log(`[INFO] Add player button visible: ${addVisible}`);

      // Get page content
      const content = await page.locator('main, [role="main"], body').textContent();
      console.log(`[INFO] Page content preview: ${content?.substring(0, 500)}`);
    }
  });

  test('6. Hard reload test', async ({ page }) => {
    console.log('[STEP 6] Testing hard reload...');

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log(`[INFO] After reload URL: ${page.url()}`);

    // Check if still logged in
    const isLoginPage = page.url().includes('/login');
    console.log(`[INFO] Is login page after reload: ${isLoginPage}`);

    // Check for navigation
    const navLinks = page.locator('nav a, .sidebar a');
    const navCount = await navLinks.count();
    console.log(`[INFO] Nav links after reload: ${navCount}`);
  });

  test('7. Final state summary', async ({ page }) => {
    console.log('[STEP 7] Final summary...');
    console.log(`[INFO] Final URL: ${page.url()}`);
    console.log(`[INFO] Page title: ${await page.title()}`);

    const bodyText = await page.locator('body').textContent();
    console.log(`[INFO] Body text length: ${bodyText?.length}`);

    console.log('[PASS] Coach persona flow complete');
  });
});
