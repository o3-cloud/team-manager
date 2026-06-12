# Context Pack 02 — Engineering Standards

> Layers 2–3 (Organization / Team). Team-manager specific standards.

## Shared principles

- Use existing project conventions before introducing new patterns.
- Prefer small, reviewable changes.
- Do not introduce new dependencies without escalation.
- Use typed interfaces for external boundaries.
- Handle errors explicitly. Do not swallow exceptions.
- No silent failures, hardcoded values, or hidden side effects.
- Add tests for behavior, not implementation details.
- Keep public API changes backward-compatible unless explicitly approved.
- Update documentation when behavior changes.
- Match the comment density, naming, and idiom of the surrounding code.

## Languages & frameworks

- **Backend:** NestJS 11, Node 26, TypeScript strict mode, TypeORM, Postgres 18.
- **Frontend:** React 19, Vite 7, Tailwind 4, daisyUI 5, react-router-dom.
- **Monorepo:** pnpm 11 workspaces (`apps/backend`, `apps/frontend`, `packages/ui`).
- No `any` — use `unknown` at boundaries; narrow with discriminated unions.

## Naming & formatting

- `camelCase` variables/functions · `PascalCase` types/classes · `UPPER_SNAKE_CASE` constants.
- Biome for linting and formatting (single-quotes, 100-char lines, `noExplicitAny`).
  - `useImportType` disabled — NestJS DI requires runtime metadata from constructor parameter types.
  - `unsafeParameterDecoratorsEnabled: true` required for NestJS decorators.
- DTO field names: camelCase in TypeScript, camelCase in JSON responses.

## Error handling

- NestJS: throw `NotFoundException` / `ForbiddenException` / `ConflictException` etc.
- Always resolve the entity first (→ 404) before enforcing authorization (→ 403).
- Wrap unhandled errors with `HttpExceptionFilter` (already wired globally).
- No floating promises; every async call is awaited or explicitly handled.

## Logging

- Structured logs via NestJS `LoggingInterceptor` (wired globally).
- Include request/response context. Never log secrets, tokens, or PII.
- OpenTelemetry traces + metrics exported to OpenObserve (`src/tracing.ts`).

## API conventions

- Global prefix: `/api` — health endpoint is `/api/health`.
- Validate all external inputs with class-validator DTOs + `ValidationPipe`.
- `SanitizeBodyMiddleware` blocks prototype-pollution keys (`__proto__`, `constructor`, `prototype`) on all request bodies globally. It does NOT strip HTML from body strings — `@Matches(/^[^<>'";&]+$/)` on stored text DTO fields is the XSS guard.
- Optimistic concurrency on `Event`: client must send `version`; mismatch → HTTP 409.
- Overlap warnings on event create/update are non-blocking (returned in response, not rejected).
- See [ADR-0001](../../docs/domain/adr/0001-schedule-api-conventions.md) for Schedule API conventions.

## Test framework & conventions

- **Unit:** Vitest (frontend) / Jest (backend); files co-located as `*.spec.ts`.
- **Integration:** NestJS `TestingModule` + Testcontainers Postgres; teardown via `app.close()` only.
- **E2E:** Playwright (Chromium); `fullyParallel: false`; JWT obtained once in `beforeAll`.
- Arrange–Act–Assert; test behavior, not implementation; deterministic, no real network in unit tests.
- No production PII in test fixtures.

## NestJS patterns

- Rate limiting: single `default` throttler in `ThrottlerModule.forRoot`; override per route with `@Throttle({ default: { ... } })`. Never register a second named throttler (bleeds onto all routes).
- `@IsNotEmpty()` does not reject whitespace-only strings — pair with `@Transform(({ value }) => value?.trim())`.
- `@Matches(/^[^<>'";&]+$/)` on stored text DTO fields (defense-in-depth XSS guard).
- In-memory throttle store resets on pod restart — document in runbooks; use Redis store for multi-replica prod.

## Full-stack scope discipline

- **API response shape → frontend interface**: When a backend endpoint's response shape changes (even additive), the corresponding frontend TypeScript interface(s) must be updated in the same run. This is REQUIRED, not optional — even if the existing frontend code "still works" by falling back to an older behavior. Failure to update the interface means the new field is never consumed, breaking acceptance criteria.
- **Scope "optional simplification" is not an escape hatch for ACs**: If an AC explicitly requires frontend rendering behavior (e.g. "display names appear, not UUIDs"), any frontend change needed to satisfy that AC is REQUIRED, regardless of scope language calling it "optional simplification." Scope language overrides ACs only when the two conflict; otherwise ACs win.
- **Checklist for additive API field in implementation gate:** (1) Update backend service/DTO; (2) update frontend TypeScript interface; (3) update render expression to consume the new field; (4) verify the field appears in the UI.

## React / frontend patterns

- Auth token in `sessionStorage`; read via `useState` lazy initializer (NOT `useEffect`) to avoid 401 race.
- `useLayoutEffect` for DOM focus after edit-mode state transitions.
- Tailwind v4: use `@tailwindcss/vite` plugin; CSS entry `@import "tailwindcss";`.
- Playwright selectors: prefer `aria-label` / `role`; avoid CSS utility class selectors.

## Dependency policy

- Pin versions via pnpm lockfile.
- New dependencies require escalation.
- Renovate handles minor/patch automerge; NestJS + OTel grouped upgrades.

## Pull request standards

- Small and focused. Description: what changed, why, risks, test evidence.
- CI must pass: lint → typecheck → unit tests → integration tests → Docker build → Trivy → SBOM → Playwright E2E.

## Learned patterns

### HTTP status semantics — validation 400 vs conflict 409

Use `BadRequestException` (400) for input that is structurally or semantically invalid
(blank string after trim, value out of allowed range). Use `ConflictException` (409) only
for resource-state conflicts (unique constraint violation, duplicate creation attempt).

Anti-pattern: `TeamsService.create` with a blank name after trim throws `ConflictException`
— the client receives 409 but the input was never valid; no conflict exists.

> Added: team-core run, 2026-05-27.

### DELETE endpoint idempotency

`DELETE` must be idempotent: calling it a second time on an already-deleted/revoked resource
must return `204` (or `200`), not `409`. Anti-pattern: `InvitesService.revoke` throws
`ConflictException` when the invite is already revoked — clients that retry on network
failure receive an error on an operation that logically succeeded.

Pattern: resolve the entity; if already in the terminal state, return the success response
without re-executing the mutation.

> Added: team-core run, 2026-05-27.

### TypeORM nullable column — always specify `type` explicitly

TypeORM **cannot infer** the database column type from a TypeScript `string | null` or `number | null` union. The inferred type becomes `"Object"` which causes a runtime error at startup.

**Rule:** Every `@Column({ nullable: true })` on a string or uuid field MUST include an explicit `type`:

```ts
// ❌ breaks — TypeORM infers "Object"
@Column({ name: 'series_id', nullable: true })
seriesId: string | null;

// ✅ correct
@Column({ name: 'series_id', type: 'uuid', nullable: true })
seriesId: string | null;

@Column({ type: 'varchar', length: 300, nullable: true })
location: string | null;
```

> Added: implement-bdrs run, 2026-05-27. Hit on EventEntity.seriesId, EventEntity.location, NotificationEntity.refId.

### TeamMemberGuard — MembershipEntity must be in forFeature

`TeamMemberGuard` injects `@InjectRepository(MembershipEntity)`. Any NestJS module whose controller is decorated with `@UseGuards(JwtAuthGuard, TeamMemberGuard)` MUST include `MembershipEntity` in its `TypeOrmModule.forFeature([..., MembershipEntity])` list, even if the module's own service does not use MembershipEntity.

Omitting it causes: `Nest can't resolve dependencies of the TeamMemberGuard`.

> Added: implement-bdrs run, 2026-05-27. Hit on rsvp, attendance, game-results, notifications modules.

### rrule — always set dtstart explicitly

`RRule.fromString(str)` with no DTSTART sets dtstart to the current moment. Calling `rule.between(futureDate, endDate)` will then return zero occurrences if the rule's computed dates (relative to "now") are all before `futureDate`.

**Pattern:** Always construct with an explicit dtstart matching the event's `firstStartsAt`:

```ts
// ❌ breaks for future dates
const rule = RRule.fromString(dto.rruleString);
const occurrences = rule.between(firstStart, endDate, true); // → []

// ✅ correct
const parsed = RRule.parseString(dto.rruleString);
const rule = new RRule({ ...parsed, dtstart: firstStart });
const occurrences = rule.between(firstStart, endDate, true); // → [...]
```

> Added: implement-bdrs run, 2026-05-27.

### NestJS `@Post()` returns 201 by default

NestJS `@Post()` endpoints return HTTP **201 Created** unless `@HttpCode(200)` is applied. This affects: cancel, reinstate, accept-invite, and any other state-transition endpoint implemented as `@Post()`. Integration tests and smoke tests must expect `201`, not `200`, for these routes.

> Added: implement-bdrs run, 2026-05-27. Caused test failures in rsvp.e2e-spec.ts (cancel step) and gate 8 smoke tests.

### Smoke test against HTTP, not service layer

Integration tests call NestJS service methods and bypass the HTTP serialization layer (field-name transforms, DTO validation, response serialization). Always supplement with at least one smoke test per new module that exercises the API over HTTP (curl or supertest at the HTTP layer) to catch:
- DTO field name mismatches (`playerName` vs `displayName`)
- Required-but-missing fields not obvious from the TS type (`seasonId` in RecordGameResultDto)
- Route path differences from what was assumed

> Added: implement-bdrs run, 2026-05-27.

### API prefix is stripped by nginx/Vite proxy, not by NestJS

The NestJS app has **no global prefix**. The `/api` prefix visible in the frontend and in API conventions is added by the reverse proxy layer:
- **Development (Vite):** `vite.config.ts` proxy forwards `/api/**` → `http://localhost:3000/**` (strips `/api`)
- **Production (nginx):** `nginx.conf` `location /api/` block forwards to the backend service (strips `/api`)

When probing the backend **directly** (bypassing nginx/Vite) — e.g., via `curl http://localhost:3001/...` or in k8s smoke tests against the backend service — use paths **without** the `/api` prefix (e.g., `GET /health`, `POST /auth/login`). The health endpoint is `/health`, not `/api/health`.

> Added: ui-backlog run, 2026-05-27. Caused confusion during gate 8 smoke tests (curl to port-forward returned 404 for `/api/health`).

### Biome enforces alphabetical import ordering at error level

Biome's `organizeImports` rule runs at **error** level — unsorted imports block the lint gate. When adding a new import to an existing file, place it in alphabetical order among the other relative imports. Biome considers the full import path string; `../common/...` sorts before `../memberships/...`.

Run `pnpm --filter backend lint` (or the workspace `biome check .`) after any import-adding change to catch this before commit.

> Added: fix-bdr-gaps run, 2026-05-28. Hit when adding `RosterEntryEntity` import to `rsvp.service.ts` after the IDOR fix.

### Roster entries are not auto-created on team join

When a user joins a team (via invite or direct membership), only a `MembershipEntity` row is created (`{ teamId, userId, role }`). **No `RosterEntry` is automatically created.** Roster entries are manually created by coaches using `POST /teams/:teamId/roster`.

Consequence: `GET /teams/:teamId/roster` returns an empty array (or entries without `userId` links) for teams where coaches have not yet populated the roster. Frontend features that depend on `roster[].userId → displayName` mapping will fall back to the userId string for unmapped members.

For future runs: if a frontend feature needs to display names for all team members, prefer modifying the members endpoint to JOIN with the users table (`UserEntity.displayName`) rather than relying on optional roster configuration.

> Added: ui-backlog run, 2026-05-27. AC-005 (display names in members tab) was CONDITIONAL at gate 8 due to this assumption.

### ValidationPipe whitelist-only behavior (does NOT reject unknown fields by default)

`ValidationPipe({ whitelist: true })` **strips** unknown fields silently — it does NOT reject them. A request body with extra fields is accepted; the extra keys are removed before the handler receives the DTO. Sending an unknown field does NOT produce a `400` response.

To also reject unknown fields, `forbidNonWhitelisted: true` must be passed alongside `whitelist: true`:

```ts
// ❌ strips unknown fields — does NOT reject
new ValidationPipe({ whitelist: true })

// ✅ strips AND rejects — returns 400 for unknown fields
new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
```

**Test impact:** A test that expects `400` when an unknown field is sent will fail unless `forbidNonWhitelisted: true` is explicitly configured. The team-manager global `ValidationPipe` uses `whitelist: true` only — unknown fields are stripped without error. Tests must not assume rejection.

> Added: bdr-ui-sprint, 2026-05-28. Caused a failing test `returns 400 for unknown field on PATCH /roster/:id` that was written assuming rejection mode.

### FK-constrained fields in integration tests must use real entity IDs

When a DTO field maps to a database foreign key column (e.g., `userId → users.id`, `teamId → teams.id`), integration tests **must** supply a real entity ID captured during test setup — not a randomly generated UUID.

A random UUID that has no corresponding row in the referenced table will violate the FK constraint and produce a TypeORM/Postgres error (500 or a constraint violation), not the `200`/`201` the test expects.

**Pattern:** Capture IDs from the `beforeAll` registration/creation steps and reuse them:

```ts
let coachUserId: string;

beforeAll(async () => {
  const r1 = await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email: 'coach@test.com', password: 'pass', displayName: 'Coach' });
  coachUserId = r1.body.user.id; // capture real ID

  // Use coachUserId in subsequent PATCH/PUT calls that reference users.id
});
```

This applies to: `userId` on `UpdateRosterEntryDto`, `memberId`/`playerId` on any linking DTO, `seasonId` on event creation, and any other FK-backed field.

> Added: bdr-ui-sprint, 2026-05-28. Caused failing test `coach can patch a roster entry to set userId` which used a random UUID that didn't satisfy the DB FK constraint on `roster_entries.user_id → users.id`.

### Health endpoint lives outside the global API prefix

The NestJS Terminus health controller (`TerminusModule`) is registered at **module root** — it does NOT inherit the `setGlobalPrefix('api')` call (which is applied per-app, but the health controller is registered before or outside the prefix boundary in `app.module.ts`).

**Rule:** The backend health endpoint is `/health`, NOT `/api/health`.

| Access path | Correct health URL |
|-------------|-------------------|
| Direct backend port (port-forward, k8s probe, integration test) | `GET /health` |
| Via nginx or Vite proxy | `GET /api/health` → proxy strips `/api` → hits `/health` on backend |

K8s liveness/readiness probes that target the backend pod directly (not via Ingress) must use `/health`:

```yaml
livenessProbe:
  httpGet:
    path: /health    # NOT /api/health
    port: 3000
```

Smoke test commands that port-forward directly to the backend service must also use `/health`:

```bash
# ✅ correct — direct backend port
curl http://localhost:3001/health

# ❌ wrong — /api is a proxy concern, not a NestJS concern
curl http://localhost:3001/api/health  # → 404
```

> Added: bdr-ui-sprint, 2026-05-28. Caused confusion during gate 8 smoke tests and was also documented as a contradiction in 08-operational-readiness.md (now corrected).
