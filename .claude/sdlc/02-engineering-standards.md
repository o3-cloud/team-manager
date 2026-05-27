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
