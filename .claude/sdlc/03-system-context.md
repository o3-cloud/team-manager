# Context Pack 03 — System Context

> Layer 4 (System). Team-manager specific.

## System purpose

Team Manager is a sports-team coordination application. Coaches create teams, build
rosters, schedule events, and communicate with players and parents. Players and parents
confirm attendance via RSVP, receive notifications about schedule changes, and review
game history. Every capability is scoped to a team; access is governed by the member's
role within that team.

## Architecture overview

**Monorepo** (`apps/backend`, `apps/frontend`, `packages/ui`).

| Component | Tech | Responsibility |
|-----------|------|----------------|
| Backend | NestJS 11, Node 26, TypeORM | REST API, business logic, JWT auth |
| Frontend | React 19, Vite 7, Tailwind 4 | SPA served by nginx in production |
| Postgres 18 | TypeORM | Primary data store |
| OpenObserve | — | Traces, metrics, browser RUM, logs |

**Local dev:** `docker-compose.yml` (Postgres, OpenObserve, backend, frontend with compose watch).
**k8s dev:** `skaffold dev` (Docker Desktop) — content-addressed image tags; eliminates stale-image failures.
**Production nginx:** SPA fallback + `/api/` proxy + RUM proxies + security headers (all at `server {}` level with `always` flag — never inside `location {}` blocks).

## Data stores

- **Postgres 18** — all application state: users, teams, memberships, invites, events,
  seasons, RSVPs, attendance records, game results, announcements, notifications, roster entries.
- No cache or message queue in current scope.

## APIs & integration points

- **Public REST API** — `/api/*`, prefixed globally; documented via Swagger.
- **Health check** — `GET /api/health` (terminus + DB ping).
- **OpenTelemetry** — backend traces/metrics exported via OTLP to OpenObserve; frontend
  browser RUM + logs via `VITE_OO_*` env vars.
- **No external third-party integrations** in current scope (notifications are in-app only).

## Authentication & authorization model

- **JWT** (`passport-jwt`); tokens issued at login, stored in browser `sessionStorage`.
- JwtAuthGuard applied globally; public endpoints decorated with `@Public()`.
- **Role-based access** per team membership: `COACH`, `ASSISTANT_COACH`, `TEAM_MANAGER`,
  `SCOREKEEPER`, `PLAYER`, `PARENT`. Guards enforce role checks after confirming team membership.
- Resource access: always resolve entity (→ 404) before enforcing team membership (→ 403).

## Known constraints & invariants

- Only one active Season per Team at a time.
- Archived Seasons are read-only.
- RSVP writes blocked on `CANCELLED` Events (RSVP gate policy).
- Attendance writes require `startsAt` in the past AND `status = SCHEDULED` (attendance gate policy).
- `Event.version` (optimistic concurrency) required on PATCH and cancellation; mismatch → HTTP 409.
- RosterEntry is distinct from Membership — a Roster entry can exist before the Player has a User account.
- Notifications are per-Member, not shared.
- `GameResult` may only be recorded for `GAME`-type Events.

## TypeORM DataSource patterns

- **Global entity registration:** `UserEntity` (and all other entities) are registered in the global TypeORM DataSource via `DatabaseModule.forRootAsync` (`apps/backend/src/database/database.module.ts:28`). A module's QueryBuilder can `leftJoin(UserEntity, 'u', ...)` without adding `UserEntity` to that module's `TypeOrmModule.forFeature` array — the DataSource covers all registered entities.
- **forFeature is for injection only:** `TypeOrmModule.forFeature([EntityX])` is required only when a module's class needs `@InjectRepository(EntityX)`. For a raw QueryBuilder JOIN against an entity from another module, no `forFeature` change is needed.
- **Projection pattern:** Use `createQueryBuilder().select().addSelect().getRawMany<T>()` with an explicit typed DTO when joining across entities and selecting a whitelist of columns. Do NOT use `findOne`/`findBy` + manual JOIN — TypeORM's QueryBuilder is the correct tool.

## Known technical debt

- Throttle store is in-memory per pod; multi-replica deployments need Redis store.
- Reminder window for event notifications not yet specified (open question in notification-delivery policy).
- `packages/ui` is a minimal stub (only `Button` and `Card` exported).
- `RosterEntryEntity` has no `@UpdateDateColumn` — clients cannot determine when an entry was last modified (TD-2, team-core).
- `GET /teams/:id/roster/:entryId` not implemented — clients must fetch the full roster to inspect a single entry (TD-3, team-core).
- Playwright E2E not run in k8s CI/dev environment (no headless display); frontend flows unverified end-to-end (TD-4, team-core).

## Ownership

- Owner: `ozanzal@gmail.com` (owen.zanzal, git user).
