import { test, expect } from '@playwright/test';

const BASE = process.env['BASE_URL'] ?? 'http://localhost:54039';

const EXPECTED_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "worker-src 'self' blob:",
];

test.describe('CSP — worker-src blob: directive', () => {
  test('response header contains worker-src self blob:', async ({ request }) => {
    const response = await request.get(BASE + '/');
    const csp = response.headers()['content-security-policy'];
    expect(csp, 'Content-Security-Policy header must be present').toBeTruthy();
    expect(csp).toContain("worker-src 'self' blob:");
  });

  test('all required directives are present and unchanged', async ({ request }) => {
    const response = await request.get(BASE + '/');
    const csp = response.headers()['content-security-policy'];
    for (const directive of EXPECTED_DIRECTIVES) {
      expect(csp, `directive "${directive}" must be in CSP`).toContain(directive);
    }
  });

  test('blob: is scoped to worker-src only — not in default-src or script-src', async ({
    request,
  }) => {
    const response = await request.get(BASE + '/');
    const csp = response.headers()['content-security-policy'];
    const directives = csp.split(';').map((d: string) => d.trim());
    const defaultSrc = directives.find((d: string) => d.startsWith('default-src'));
    const scriptSrc = directives.find((d: string) => d.startsWith('script-src'));
    expect(defaultSrc, 'default-src must not include blob:').not.toContain('blob:');
    expect(scriptSrc, 'script-src must not include blob:').not.toContain('blob:');
  });

  test('no worker-src CSP violation in browser console on page load', async ({ page }) => {
    const violations: string[] = [];
    page.on('console', (msg) => {
      if (
        msg.type() === 'error' &&
        msg.text().toLowerCase().includes('worker-src')
      ) {
        violations.push(msg.text());
      }
    });
    await page.goto(BASE + '/');
    // Give the OO RUM SDK time to initialise and attempt to create the worker
    await page.waitForTimeout(2000);
    expect(violations, 'No worker-src CSP violations should appear in console').toHaveLength(0);
  });

  test('CSP header is sent on error responses too (always flag)', async ({ request }) => {
    const response = await request.get(BASE + '/nonexistent-path-404-check');
    // nginx serves index.html for unknown paths (SPA fallback) — CSP must still be present
    const csp = response.headers()['content-security-policy'];
    expect(csp, 'CSP header must be present on all responses (always flag)').toBeTruthy();
    expect(csp).toContain("worker-src 'self' blob:");
  });
});
