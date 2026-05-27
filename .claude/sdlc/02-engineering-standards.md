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
- `SanitizeBodyMiddleware` strips HTML from body strings globally.
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
