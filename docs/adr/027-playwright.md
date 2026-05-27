# ADR-027: Playwright

## Status

Accepted

## Context and Problem Statement

The team needs a browser-automation framework for end-to-end testing across Chromium, Firefox, and WebKit. Without shared conventions, teams write brittle tests tied to CSS classes and DOM structure, introduce hidden test-to-test dependencies through shared browser state, and manually wait for conditions that Playwright's auto-waiting already handles — producing suites that are slow, flaky, and costly to maintain. We need conventions that keep Playwright suites stable, independent, and actionable on failure.

## Decision Drivers

- Locator stability: user-facing locators (`getByRole`, `getByLabel`, `getByText`) survive markup refactors that break CSS-selector tests
- Auto-waiting: web-first assertions (`toBeVisible`, `toHaveText`) eliminate manual sleeps and timing-dependent failures
- Test isolation: each test gets its own browser context with fresh storage, preventing state leakage between tests
- Diagnostic quality: trace capture on first retry via Trace Viewer gives CI failures actionable replay data

## Considered Options

- Playwright with user-facing locators, web-first assertions, per-test browser contexts, and trace capture
- Cypress (JavaScript-only, no WebKit, different isolation model)
- Selenium WebDriver (older API, more verbose, no auto-waiting by default)
- Puppeteer (Chromium-only, no built-in test runner)

## Decision Outcome

We will use Playwright for all browser-based end-to-end tests. Elements are located using `getByRole()`, `getByLabel()`, `getByText()`, `getByPlaceholder()`, and `getByTestId()` — CSS class selectors and XPath are forbidden. Assertions use web-first methods (`toBeVisible()`, `toHaveText()`, etc.) that auto-retry. `page.waitForTimeout()` and fixed sleeps are forbidden. Each test has its own browser context with fresh storage, cookies, and session state. `retries: process.env.CI ? 2 : 0` is set in config. Traces are captured on first retry (`trace: 'on-first-retry'`). `forbidOnly: !!process.env.CI` prevents committed `test.only` markers. `baseURL` is defined in config; tests use relative paths. External services are mocked with `page.route()`. Repeated multi-step interactions are extracted into Page Object classes.

## Consequences

- Positive: user-facing locators survive markup refactors; tests test behavior, not implementation
- Positive: auto-waiting eliminates the most common source of flaky E2E tests (timing-based failures)
- Positive: trace capture on failure makes CI debugging practical without re-running locally
- Negative: Playwright test runs require real browser binaries, adding CI setup time and disk usage
- Negative: Page Object maintenance adds overhead as the UI evolves
- Neutral: CSS class selectors, XPath locators, and `page.waitForTimeout()` are forbidden
