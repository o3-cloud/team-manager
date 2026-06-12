# Context Pack 06 — Test Strategy

> Layers 2–3 (Organization / Team). Team-manager specific overlays on top of defaults.

## Default test strategy

- Unit tests for pure business logic and domain rules.
- Integration tests for service / database / API boundaries (real Postgres via Testcontainers).
- Regression tests for bug fixes.
- Negative tests for invalid input, wrong role, missing version, gate-policy violations, and failure states.
- Do not mock the behavior being tested.
- Prefer deterministic tests over broad snapshot tests.
- Use fixed/mocked time for time-dependent logic (attendance gate temporal guard).

## Test pyramid

Many fast unit tests → fewer NestJS integration tests → few Playwright E2E tests.

## NestJS integration test patterns

- Use a real Postgres container per test suite (Testcontainers).
- Teardown: `app.close()` only — do NOT call `dataSource.destroy()` after `app.close()`.
- Seed minimal data per test; clean up in `afterEach` via API calls using a `beforeAll` JWT.

## Playwright E2E patterns

**Config defaults (k8s stack):**
```typescript
timeout: 60_000          // k8s cold-start
expect: { timeout: 10_000 }
fullyParallel: false     // shared seeded DB user — avoid afterEach/beforeEach race
use: { actionTimeout: 15_000, trace: 'on-first-retry' }
```

**Selector priority:**
1. `aria-label` and `role` — most stable.
2. `:has-text()` scoped to parent row — when text is unique per row.
3. `button:has-text("Add")` — text-content fallback only.
4. Never CSS utility class selectors (`.btn-active`, `.line-through`) — brittle.

For dynamic `aria-label` template literals, use starts-with: `[aria-label^="Delete"]`.

**State assertions — read the DOM:**
- Checkbox → `toBeChecked()` on `<input type="checkbox">`.
- Pressed → `toHaveAttribute('aria-pressed', 'true')`.
- Disabled → `toBeDisabled()`.

**Throttle-aware login (login is rate-limited: 5 req / 15 min, in-memory per pod):**
1. `beforeAll`: obtain one JWT via direct API call.
2. Per test: inject JWT via `page.addInitScript` → `sessionStorage.setItem('access_token', token)` before `page.goto('/')`.
3. `afterEach`: clean up test data via direct API calls using the `beforeAll` token.
4. If `beforeAll` fires again (new Playwright worker on retry): restart backend pod to reset throttle.

**Image freshness before E2E on k8s:**
```bash
kubectl exec -n team-manager deploy/frontend -- find /usr/share/nginx/html -name 'index-*.js'
# Compare hash against dist/ output
```
Fast fix: `kubectl cp dist/ <pod>:/usr/share/nginx/html/`. Correct fix: new tag + updated deployment.
Preferred: `skaffold dev` (content-addressed tags, eliminates stale-image class entirely).

## When to add more

- **Performance/load tests:** latency- or throughput-sensitive paths (e.g., season-wide attendance queries).
- **Accessibility tests:** any user-facing UI change.
- **Security tests:** auth endpoints, input handling, role enforcement.

## Test data

Safe, realistic, repeatable. No production PII in fixtures. Use `ozanzal@gmail.com` or synthetic data only.

## Traceability

Each test traces back to a BDR scenario or a risk mitigation. State explicitly which tests are NOT worth adding and why.

## Learned patterns

### JWT_SECRET in auth integration tests

When removing a JWT secret fallback (`?? 'fallback-secret'`), the full NestJS module
initializer will call `getOrThrow('jwt.secret')` during test setup. Without `JWT_SECRET`
set, every test fails with a config error rather than the actual test failure.

Add at the top of `test/helpers/test-app.ts` (or equivalent bootstrap, before `createNestApplication`):

```typescript
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-for-integration-tests';
```

The `??` preserves any value already set in the test environment (CI, `.env.test`).
This is not a fallback for production — it is test scaffolding in a non-shipped file.

> Added: security-hardening run, 2026-05-27.

### API contract coverage — gaps that surface in simulation not gate 5

Integration tests focused on happy paths and core security boundaries missed three medium
defects that were only caught during gate 8 UX simulation. For every endpoint, the integration
test suite must include:

- **Correct HTTP status for non-existent resources:** `GET /teams/:nonExistentId` must return
  404, not 403. Write a negative test that probes with a valid JWT but a non-existent ID.
- **DELETE idempotency:** call `DELETE /resource/:id` twice; assert the second call returns
  `2xx`, not `409`.
- **Stored-value round-trip:** POST a resource with untrusted input (e.g. `<script>` in a name
  field); GET it back; assert the stored value matches the sanitized/rejected form — not the raw
  payload.

> Added: team-core run, 2026-05-27.
