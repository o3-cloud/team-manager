# Context Pack 06 — Test Strategy

> Layers 2–3 (Organization / Team). Reusable, with project-specific overlays.

## Default test strategy

- Add unit tests for pure business logic.
- Add integration tests for service / database / API boundaries.
- Add contract tests when public APIs or event schemas change.
- Add regression tests for bug fixes.
- Add negative tests for invalid input, permissions, timeouts, and failure states.
- Do not mock the behavior being tested.
- Prefer deterministic tests over broad snapshot tests.
- Test behavior, not implementation details.
- Use fixed or mocked time for time-dependent logic.

## Test pyramid

Many fast unit tests → fewer integration tests → few end-to-end tests.

## When to add more

- **Performance / load tests:** latency-, throughput-, or capacity-sensitive paths.
- **Accessibility tests:** any user-facing UI change.
- **Security tests:** auth, input handling, or sensitive-data paths.

## Test data

Safe, realistic, repeatable. No production PII in test fixtures.

## Traceability

Every test should trace back to a Gherkin scenario and/or a risk mitigation. State
explicitly which tests are *not* worth adding, and why.

## Playwright / browser e2e patterns

> Added: todo-e2e-k8s-playwright run, 2026-05-24.

**Selector strategy (priority order):**
1. `aria-label` and `role` — most stable; survive CSS refactors.
2. `:has-text()` scoped to a parent row (`li`, `article`) — targets the right item when text is unique per row.
3. `button:has-text("Add")` — text-content fallback only where `aria-label` is absent.
4. Never use CSS utility class selectors (`.line-through`, `.btn-active`) — brittle to design-system changes.

**Dynamic `aria-label` values:** When a component uses a template literal (e.g. `aria-label={`Delete "${item.text}"`}`), use a starts-with match: `[aria-label^="Delete"]`. Exact-match `[aria-label="Delete"]` will not find it. Always read the component source for buttons with contextual labels before writing selectors.

**State assertions — read the DOM, not assumed class names:** For toggled states (completed, selected, active), read the component source before writing assertions. Common patterns:
- Checkbox state → `toBeChecked()` / `not.toBeChecked()` on `<input type="checkbox">` — NOT `toHaveClass(/completed/)` on a parent `<li>` unless the component actually sets that class.
- Pressed button → `toHaveAttribute('aria-pressed', 'true')`.
- Disabled element → `toBeDisabled()`.

**`beforeAll` + `afterEach` API cleanup:** For Playwright tests against a shared DB with a single seeded user, obtain a JWT in `beforeAll` via direct API call, then use it in `afterEach` to DELETE all records the test created. Idempotent across retries; avoids test-order dependencies. Pair with `fullyParallel: false` to prevent cleanup racing the next test's setup.

**`playwright-cli` availability:** The Claude Code `playwright-cli` skill requires a live stack reachable at the configured `baseURL`. Treat it as an interactive second pass for already-running stacks — it cannot substitute for `pnpm test:e2e` or for a running server.

**Throttle-aware login strategy (when login is rate-limited):**
When the login endpoint has a strict rate limit (e.g., 5 req / 15 min, in-memory per
pod), E2E tests must not call the login API once per test. Use this pattern instead:
1. `beforeAll`: obtain one JWT via a direct backend API call (counts 1 against the throttle).
2. Per test requiring auth: inject the JWT via `page.addInitScript` → `sessionStorage.setItem('access_token', token)` before `page.goto('/')`.
3. `afterEach`: clean up test data via direct API calls using the `beforeAll` token (no additional logins).
4. If `beforeAll` is called multiple times (Playwright spawns a new worker on retry), restart the backend pod to reset the in-memory throttle before re-running.

For `addInitScript` injection to work with React sessionStorage auth, the React context
**must** use a `useState` lazy initializer to read storage — not `useEffect`. See
`07-security-privacy.md` § "React auth: lazy `useState` init".

> Added: todo-ux-bugfixes run, 2026-05-26.

---

## Deployment validation — Docker/k8s image freshness

> Added: todo-ux-bugfixes run, 2026-05-26.

Docker Desktop's k8s uses containerd's image store, **separate** from the Docker
daemon's store. Running `docker build` (even `--no-cache`) in the Docker daemon does
not guarantee k8s serves the new image when the deployment references the same tag —
containerd caches the prior digest independently.

**Before running E2E tests against a k8s stack, verify the deployed bundle matches
current source:**

```bash
# Check which JS bundle is running in the pod
kubectl exec -n <ns> deploy/<frontend> -- find /usr/share/nginx/html -name 'index-*.js'
# Compare hash against locally-built output in dist/
```

If mismatched during development:
- **Fast fix:** `kubectl cp dist/ <pod>:/usr/share/nginx/html/` — immediate effect, lasts until pod restart
- **Correct fix:** rebuild with a new/unique tag; update the k8s deployment image reference

**Preferred workflow:** use `skaffold dev` — it builds with content-addressed tags and
syncs images to k8s automatically, eliminating the stale-image class of failure entirely.

---

## UX simulation — persona account isolation

When running multi-persona UX simulations (e.g., `/sdlc:simulate`), each persona
agent MUST use an isolated user account. If all personas share the same JWT / user ID:
- Cleanup by one agent deletes data created by concurrent agents.
- State assertions fail for reasons unrelated to application bugs (false positives).

For single-account demo apps: obtain a fresh shared token, give it to all agents,
and have each agent clean up only the specific record IDs it created (not "delete all").
Document concurrent-agent data pollution as a test isolation artifact, not an app bug.
