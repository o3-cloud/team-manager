import { test, expect, Page } from '@playwright/test';

test.describe('Parent User Flow', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:54039/');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. Check initial page load', async () => {
    await expect(page).toHaveURL('http://localhost:54039/');
    const title = await page.title();
    console.log('Page title:', title);

    // Take screenshot
    await page.screenshot({ path: 'e2e/test-results/01-initial-page.png' });

    // Get all visible text
    const bodyText = await page.locator('body').textContent();
    console.log('Initial page content:', bodyText?.substring(0, 1000));

    // Look for navigation elements
    const navText = await page.locator('nav, header, [role="navigation"]').textContent().catch(() => '');
    console.log('Navigation content:', navText?.substring(0, 500));
  });

  test('2. Try to access invites page with token', async () => {
    await page.goto('http://localhost:54039/invites/test-token-123');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/test-results/02-invites-page.png' });

    const invitesContent = await page.locator('body').textContent();
    console.log('Invites page content:', invitesContent?.substring(0, 1000));

    // Look for invite-related elements
    const hasAcceptButton = await page.isVisible('button:has-text("Accept"), button:has-text("Join")').catch(() => false);
    console.log('Has accept/join button:', hasAcceptButton);
  });

  test('3. Navigate to team page', async () => {
    await page.goto('http://localhost:54039/teams');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/test-results/03-teams-page.png' });

    const teamsContent = await page.locator('body').textContent();
    console.log('Teams page content:', teamsContent?.substring(0, 1000));
  });

  test('4. Try to RSVP to event', async () => {
    await page.goto('http://localhost:54039/events');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/test-results/04-events-page.png' });

    const eventsContent = await page.locator('body').textContent();
    console.log('Events page content:', eventsContent?.substring(0, 1000));

    // Look for RSVP buttons
    const hasRsvpButton = await page.isVisible('button:has-text("RSVP"), button:has-text("Attending"), button:has-text("Not Attending")').catch(() => false);
    console.log('Has RSVP button:', hasRsvpButton);
  });

  test('5. Check for parent selector', async () => {
    await page.goto('http://localhost:54039/');
    await page.waitForTimeout(1000);

    // Look for any dropdown or selector that might be for parent/child selection
    const hasParentSelector = await page.isVisible('select:has-text("Parent"), select:has-text("child"), [data-testid="parent-selector"], .parent-selector, label:has-text("Parent")').catch(() => false);
    console.log('Has parent selector:', hasParentSelector);

    // Look for any profile/account related elements
    const hasProfileElement = await page.isVisible('[data-testid="profile"], .profile, #profile, [role="button"]:has-text("Profile"), [role="button"]:has-text("Account"), [role="button"]:has-text("Login"), [role="button"]:has-text("Sign")').catch(() => false);
    console.log('Has profile/login element:', hasProfileElement);

    // Check for any dropdowns
    const dropdowns = await page.locator('select, [role="listbox"], [role="menu"]').count();
    console.log('Number of dropdowns:', dropdowns);

    await page.screenshot({ path: 'e2e/test-results/05-parent-selector-check.png' });
  });

  test('6. Check console for errors during navigation', async () => {
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
    await page.waitForTimeout(2000);
    await page.goto('http://localhost:54039/teams');
    await page.waitForTimeout(2000);
    await page.goto('http://localhost:54039/events');
    await page.waitForTimeout(2000);

    console.log('All errors collected:', errors);
    console.log('Total errors:', errors.length);
  });
});
