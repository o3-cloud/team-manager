/**
 * ADR 011: Playwright CLI smoke test configuration.
 *
 * Storybook 8 + test-runner 0.21+ includes a built-in a11y integration that
 * reads accessibility results already computed by @storybook/addon-a11y instead
 * of running a separate axe scan. This avoids the "Axe is already running" race
 * condition that occurs when axe-playwright's checkA11y() fires while the addon
 * is still executing its own axe run.
 *
 * The built-in integration is activated via parameters.a11y.test = "error" set
 * globally in .storybook/preview.ts. The test-runner reads violations from the
 * addon's reporter and fails the test when violations are found.
 *
 * Per-story rule overrides: stories can opt out of specific axe rules by
 * setting parameters.a11y.config.rules in their story or meta:
 *
 *   parameters: {
 *     a11y: {
 *       config: {
 *         rules: [{ id: 'color-contrast', enabled: false }],
 *       },
 *     },
 *   },
 *
 * This is used for components whose contrast is theme-dependent (daisyUI
 * colors vary by theme; the default theme may not meet WCAG 2 AA for every
 * color combination).
 *
 * Usage:
 *   bun run storybook        # start dev server (port 6006)
 *   bun run test:storybook   # run all story play() functions + a11y checks
 *
 * For agent-driven spot checks (ADR 011 pattern), use playwright CLI directly:
 *   bunx playwright screenshot http://localhost:6006/iframe.html?id=components-button--default /tmp/smoke.png
 *   bun run smoke:storybook   # screenshots of Button + Badge into .context/screenshots/
 *
 * Reference: https://storybook.js.org/docs/writing-tests/accessibility-testing
 *
 * @type {import('@storybook/test-runner').TestRunnerConfig}
 */
const config = {};

module.exports = config;
