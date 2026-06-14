import { expect, test } from '@playwright/test';

const TEST_TEAM_NAME = 'Dashboard E2E Team';

/**
 * Dashboard E2E regression spec.
 *
 * Creates a fresh coach account and team, then verifies the team dashboard
 * renders its heading, stat cards, content sections, and shared AppLayout
 * navigation shell.
 *
 * This spec requires a running backend API. The frontend dev server is started
 * automatically by the Playwright webServer configuration when not in CI.
 */
test.describe('Team Dashboard', () => {
  test('registers a coach, creates a team, and renders the dashboard', async ({ page }) => {
    const timestamp = Date.now();
    const email = `coach.dashboard.${timestamp}@example.com`;
    const password = 'DashboardTest123!';
    const displayName = 'Dashboard Test Coach';

    // 1. Register a new coach account.
    await page.goto('/register');
    await expect(page).toHaveURL('/register');
    await page.getByLabel('Display name').fill(displayName);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: /create account/i }).click();
    await page.waitForURL('/teams', { timeout: 10000 });

    // 2. Create a team.
    await page.getByPlaceholder('New team name').fill(TEST_TEAM_NAME);
    await page.getByRole('button', { name: /create/i }).click();

    // 3. Open the newly created team; the index route redirects to dashboard.
    await page.getByRole('link', { name: TEST_TEAM_NAME }).click();
    await page.waitForURL(/\/teams\/[^/]+\/dashboard/, { timeout: 10000 });

    // 4. Assert dashboard heading and stat cards.
    await expect(page.getByRole('heading', { name: /team dashboard/i })).toBeVisible();
    await expect(page.getByText('Upcoming Events')).toBeVisible();
    await expect(page.getByText('Active Players')).toBeVisible();
    await expect(page.getByText('Alerts')).toBeVisible();

    // 5. Assert dashboard content sections.
    await expect(page.getByText('Next Event')).toBeVisible();
    await expect(page.getByText('Schedule')).toBeVisible();
    await expect(page.getByText('Recent Messages')).toBeVisible();
    await expect(page.getByText('Team Overview')).toBeVisible();

    // 6. Assert AppLayout navigation shell.
    await expect(page.getByTestId('topbar-team-name')).toBeVisible();
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /events/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /roster/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /schedule/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /messages/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /notifications/i })).toBeVisible();
  });
});
