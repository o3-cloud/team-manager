import { test, expect, Page } from '@playwright/test';

test.describe('Parent User Flow - Full Test', () => {
  let page: Page;
  const testEmail = `parent_${Date.now()}@test.com`;
  const testPassword = 'TestPassword123!';

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. Initial page - should redirect to login', async () => {
    await page.goto('http://localhost:54039/');
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    console.log('Initial URL after redirect:', currentUrl);
    expect(currentUrl).toContain('login');

    await page.screenshot({ path: 'e2e/test-results/01-login-page.png' });

    // Check for login form
    const hasEmailInput = await page.isVisible('input[type="email"], input[name="email"]').catch(() => false);
    const hasPasswordInput = await page.isVisible('input[type="password"], input[name="password"]').catch(() => false);
    const hasSignInButton = await page.isVisible('button:has-text("Sign in"), button:has-text("Login")').catch(() => false);

    console.log('Has email input:', hasEmailInput);
    console.log('Has password input:', hasPasswordInput);
    console.log('Has sign in button:', hasSignInButton);
  });

  test('2. Register a new parent account', async () => {
    await page.goto('http://localhost:54039/login');
    await page.waitForTimeout(500);

    // Look for register link
    const registerLink = page.locator('a:has-text("Register"), a:has-text("Sign up"), button:has-text("Register"), button:has-text("Sign up")');
    const hasRegister = await registerLink.count() > 0;
    console.log('Has register link:', hasRegister);

    if (hasRegister) {
      await registerLink.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'e2e/test-results/02-register-page.png' });
    }

    // Try to fill registration form
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]');

    if (await emailInput.count() > 0) {
      await emailInput.first().fill(testEmail);
      console.log('Filled email:', testEmail);
    }

    if (await passwordInput.count() > 0) {
      await passwordInput.first().fill(testPassword);
      console.log('Filled password');
    }

    // Look for submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign up"), button:has-text("Create Account")');
    if (await submitButton.count() > 0) {
      await submitButton.first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'e2e/test-results/03-after-register.png' });
      console.log('Clicked register button');
    }

    console.log('Current URL after registration attempt:', page.url());
  });

  test('3. Login with parent account', async () => {
    await page.goto('http://localhost:54039/login');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'e2e/test-results/04-login-form.png' });

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const signInButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');

    if (await emailInput.count() > 0) {
      await emailInput.first().fill(testEmail);
    }
    if (await passwordInput.count() > 0) {
      await passwordInput.first().fill(testPassword);
    }
    if (await signInButton.count() > 0) {
      await signInButton.first().click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'e2e/test-results/05-after-login.png' });
    console.log('URL after login:', page.url());

    // Check if we're logged in (should redirect from login page)
    const currentUrl = page.url();
    console.log('Logged in? URL is not login page:', !currentUrl.includes('login'));
  });

  test('4. Try to access invites page', async () => {
    // Try accessing invites page with a test token
    await page.goto('http://localhost:54039/invites/test-token-123');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/test-results/06-invites-page.png' });

    const invitesContent = await page.locator('body').textContent();
    console.log('Invites page content (first 1000 chars):', invitesContent?.substring(0, 1000));

    // Look for invite-related elements
    const hasAcceptButton = await page.isVisible('button:has-text("Accept"), button:has-text("Join"), button:has-text("Accept Invite")').catch(() => false);
    console.log('Has accept/join button:', hasAcceptButton);

    // Look for invite message
    const hasInviteMessage = await page.isVisible('text=invite', 'text=Invitation', 'text=team').catch(() => false);
    console.log('Has invite message:', hasInviteMessage);
  });

  test('5. Navigate to team page', async () => {
    await page.goto('http://localhost:54039/teams');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/test-results/07-teams-page.png' });

    const teamsContent = await page.locator('body').textContent();
    console.log('Teams page content (first 1000 chars):', teamsContent?.substring(0, 1000));

    // Look for team-related elements
    const hasTeamList = await page.isVisible('[data-testid="team-list"], .team-list, ul:has-text("Team"), table').catch(() => false);
    console.log('Has team list:', hasTeamList);

    // Look for "create team" or "add team" buttons
    const hasAddTeamButton = await page.isVisible('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').catch(() => false);
    console.log('Has add team button:', hasAddTeamButton);
  });

  test('6. Navigate to events page and check RSVP', async () => {
    await page.goto('http://localhost:54039/events');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/test-results/08-events-page.png' });

    const eventsContent = await page.locator('body').textContent();
    console.log('Events page content (first 1000 chars):', eventsContent?.substring(0, 1000));

    // Look for RSVP buttons
    const hasRsvpButton = await page.isVisible('button:has-text("RSVP"), button:has-text("Attending"), button:has-text("Not Attending"), button:has-text("Maybe")').catch(() => false);
    console.log('Has RSVP button:', hasRsvpButton);

    // Look for events list
    const hasEventsList = await page.isVisible('[data-testid="event-list"], .event-list, ul:has-text("Event"), [role="list"]').catch(() => false);
    console.log('Has events list:', hasEventsList);
  });

  test('7. Check for parent selector when viewing events/teams', async () => {
    await page.goto('http://localhost:54039/');
    await page.waitForTimeout(1000);

    // Look for any dropdown or selector that might be for parent/child selection
    const allText = await page.locator('body').textContent();
    console.log('All page text (first 500 chars):', allText?.substring(0, 500));

    // Look for parent/child related text
    const hasParentText = allText?.toLowerCase().includes('parent') || false;
    const hasChildText = allText?.toLowerCase().includes('child') || false;
    const hasPlayerText = allText?.toLowerCase().includes('player') || false;

    console.log('Has "parent" text:', hasParentText);
    console.log('Has "child" text:', hasChildText);
    console.log('Has "player" text:', hasPlayerText);

    // Check for any dropdowns
    const dropdowns = await page.locator('select').count();
    console.log('Number of select dropdowns:', dropdowns);

    // Look for any role="listbox" or custom dropdowns
    const customDropdowns = await page.locator('[role="listbox"], [role="menu"]').count();
    console.log('Number of custom dropdowns:', customDropdowns);

    await page.screenshot({ path: 'e2e/test-results/09-parent-selector-check.png' });
  });

  test('8. Check navigation menu', async () => {
    await page.goto('http://localhost:54039/');
    await page.waitForTimeout(1000);

    // Look for navigation elements
    const nav = page.locator('nav, header, [role="navigation"], .nav, .navbar, .menu');
    const navCount = await nav.count();
    console.log('Number of nav elements:', navCount);

    if (navCount > 0) {
      const navText = await nav.first().textContent();
      console.log('Navigation content:', navText?.substring(0, 500));

      // Look for specific nav links
      const hasTeamsLink = await page.isVisible('a:has-text("Team"), a:has-text("Teams")').catch(() => false);
      const hasEventsLink = await page.isVisible('a:has-text("Event"), a:has-text("Events")').catch(() => false);
      const hasProfileLink = await page.isVisible('a:has-text("Profile"), a:has-text("Account"), [data-testid="profile"]').catch(() => false);

      console.log('Has Teams link:', hasTeamsLink);
      console.log('Has Events link:', hasEventsLink);
      console.log('Has Profile link:', hasProfileLink);
    }

    await page.screenshot({ path: 'e2e/test-results/10-navigation.png' });
  });

  test('9. Collect all console errors', async () => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`[CONSOLE] ${msg.text()}`);
      }
    });
    page.on('pageerror', error => {
      errors.push(`[PAGEERROR] ${error.message}`);
    });
    page.on('requestfailed', request => {
      errors.push(`[REQUESTFAILED] ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Navigate through key pages
    await page.goto('http://localhost:54039/');
    await page.waitForTimeout(1000);
    await page.goto('http://localhost:54039/teams');
    await page.waitForTimeout(1000);
    await page.goto('http://localhost:54039/events');
    await page.waitForTimeout(1000);
    await page.goto('http://localhost:54039/invites/test-token');
    await page.waitForTimeout(1000);

    console.log('All errors collected:', errors);
    console.log('Total errors:', errors.length);

    // Filter out expected RUM errors
    const nonRumErrors = errors.filter(e => !e.includes('/rum/v1/'));
    console.log('Non-RUM errors:', nonRumErrors);
  });
});
