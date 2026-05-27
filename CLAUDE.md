# Team Manager — Project Index

## Domain model

- [Ubiquitous language](docs/domain/ubiquitous-language.md)
- [Context map](docs/domain/context-map.md)
- [Domain README](docs/domain/README.md)

### Bounded contexts
- [Identity](docs/domain/bounded-contexts/identity.md)
- [Team](docs/domain/bounded-contexts/team.md)
- [Schedule](docs/domain/bounded-contexts/schedule.md)
- [Participation](docs/domain/bounded-contexts/participation.md)
- [Results](docs/domain/bounded-contexts/results.md)
- [Communication](docs/domain/bounded-contexts/communication.md)

### Aggregates
- [User](docs/domain/aggregates/user.md) · [Team](docs/domain/aggregates/team.md) · [Membership](docs/domain/aggregates/membership.md) · [Invite](docs/domain/aggregates/invite.md)
- [Event](docs/domain/aggregates/event.md) · [RecurringEventSeries](docs/domain/aggregates/recurring-event-series.md) · [Season](docs/domain/aggregates/season.md)
- [RSVP](docs/domain/aggregates/rsvp.md) · [AttendanceRecord](docs/domain/aggregates/attendance-record.md)
- [GameResult](docs/domain/aggregates/game-result.md)
- [Announcement](docs/domain/aggregates/announcement.md)

### Domain events
[EventCreated](docs/domain/domain-events/event-created.md) · [EventUpdated](docs/domain/domain-events/event-updated.md) · [EventCancelled](docs/domain/domain-events/event-cancelled.md) · [EventReinstated](docs/domain/domain-events/event-reinstated.md) · [InviteAccepted](docs/domain/domain-events/invite-accepted.md) · [GameResultRecorded](docs/domain/domain-events/game-result-recorded.md) · [AnnouncementPosted](docs/domain/domain-events/announcement-posted.md)

### Policies
- [RSVP gate](docs/domain/policies/rsvp-gate.md)
- [Attendance gate](docs/domain/policies/attendance-gate.md)
- [Notification delivery](docs/domain/policies/notification-delivery.md)

### Architecture decisions
- [ADR-0001 Schedule API conventions](docs/domain/adr/0001-schedule-api-conventions.md)

---

## Behaviour-driven requirements (BDRs)

[Index](docs/bdr/index.md) · [Template](docs/bdr/000-template.md)

| # | Topic |
|---|-------|
| 001 | [User registration](docs/bdr/001-user-registration.md) |
| 002 | [Team creation](docs/bdr/002-team-creation.md) |
| 003 | [Role assignment](docs/bdr/003-role-assignment.md) |
| 004 | [Roster management](docs/bdr/004-roster-management.md) |
| 005 | [Event scheduling](docs/bdr/005-event-scheduling.md) |
| 006 | [Recurring events](docs/bdr/006-recurring-events.md) |
| 007 | [RSVP](docs/bdr/007-rsvp.md) |
| 008 | [Attendance tracking](docs/bdr/008-attendance-tracking.md) |
| 009 | [Game results](docs/bdr/009-game-results.md) |
| 010 | [Announcements](docs/bdr/010-announcements.md) |
| 011 | [Notifications](docs/bdr/011-notifications.md) |
| 012 | [Team joining](docs/bdr/012-team-joining.md) |
| 013 | [Season management](docs/bdr/013-season-management.md) |
| 014 | [Extended role permissions](docs/bdr/014-extended-role-permissions.md) |
| 015 | [Event cancellation](docs/bdr/015-event-cancellation.md) |

---

## Backend (`apps/backend` — NestJS 11, Node 26)

| File | Purpose |
|------|---------|
| [src/main.ts](apps/backend/src/main.ts) | Bootstrap: OTel init, ValidationPipe, Swagger, Helmet |
| [src/app.module.ts](apps/backend/src/app.module.ts) | Root module — wires Config, Database, Health, Users, Auth |
| [src/tracing.ts](apps/backend/src/tracing.ts) | OpenTelemetry SDK (traces + metrics + logs → OpenObserve) |
| [src/config/configuration.ts](apps/backend/src/config/configuration.ts) | Typed config factory (port, database URL, JWT, OTel endpoint) |
| [src/database/database.module.ts](apps/backend/src/database/database.module.ts) | TypeORM + Postgres async setup |
| [src/auth/](apps/backend/src/auth/) | JWT auth: register/login, JwtStrategy, JwtAuthGuard |
| [src/users/](apps/backend/src/users/) | UsersService + UserEntity (TypeORM) |
| [src/health/](apps/backend/src/health/) | `/health` endpoint (terminus + DB ping) |
| [src/common/](apps/backend/src/common/) | Shared: RolesGuard, Roles decorator, HttpExceptionFilter, LoggingInterceptor, SanitizeBodyMiddleware |
| [src/migrations/](apps/backend/src/migrations/) | TypeORM migration files (empty — add here) |
| [package.json](apps/backend/package.json) | Dependencies (NestJS 11, TypeORM, OTel 0.217, bcrypt, passport-jwt) |

---

## Frontend (`apps/frontend` — React 19, Vite 7)

| File | Purpose |
|------|---------|
| [src/main.tsx](apps/frontend/src/main.tsx) | Entry — imports telemetry first, then mounts React |
| [src/App.tsx](apps/frontend/src/App.tsx) | Root component |
| [src/telemetry.ts](apps/frontend/src/telemetry.ts) | OpenObserve RUM + browser-logs init (reads `VITE_OO_*` env) |
| [src/index.css](apps/frontend/src/index.css) | Tailwind 4 + daisyUI 5 import |
| [src/mocks/handlers.ts](apps/frontend/src/mocks/handlers.ts) | MSW request handlers (empty — add here) |
| [vite.config.ts](apps/frontend/vite.config.ts) | Vite: React plugin, Tailwind, `/api` proxy to backend, Vitest config |
| [playwright.config.ts](apps/frontend/playwright.config.ts) | Playwright E2E config (Chromium, `BASE_URL` from env) |
| [nginx.conf](apps/frontend/nginx.conf) | Production nginx: SPA fallback, `/api/` proxy, RUM proxies, security headers |
| [package.json](apps/frontend/package.json) | Dependencies (React 19, react-router-dom, OO browser SDK, Tailwind, daisyUI, Vitest, Playwright) |

---

## UI component library (`packages/ui`)

Minimal stub — exports `Button` and `Card`. Extend by adding `src/components/<Name>/` and re-exporting from [`src/index.ts`](packages/ui/src/index.ts).

---

## Infrastructure

| File | Purpose |
|------|---------|
| [docker-compose.yml](docker-compose.yml) | Local dev: Postgres 18, OpenObserve, backend, frontend (with `compose watch`) |
| [skaffold.yaml](skaffold.yaml) | Kubernetes dev loop (Docker Desktop) — build, deploy, port-forward |
| [Makefile](Makefile) | Operator surface: `make secrets / dev / build / test / clean / doctor` |
| [k8s/namespace.yaml](k8s/namespace.yaml) | Namespace `team-manager` |
| [k8s/secrets.example.yaml](k8s/secrets.example.yaml) | Secret template — `make secrets` generates the live `k8s/secrets.yaml` |
| [k8s/postgres-statefulset.yaml](k8s/postgres-statefulset.yaml) | Postgres StatefulSet + Service |
| [k8s/openobserve.yaml](k8s/openobserve.yaml) | OpenObserve Deployment + Service (observability) |
| [k8s/backend-deployment.yaml](k8s/backend-deployment.yaml) | Backend Deployment + ConfigMap + Service |
| [k8s/frontend-deployment.yaml](k8s/frontend-deployment.yaml) | Frontend Deployment + Service + Ingress |
| [.github/workflows/ci.yml](.github/workflows/ci.yml) | CI: lint → typecheck → unit tests → integration tests → Docker build → Trivy scan → SBOM → Playwright E2E |

---

## Tooling config

| File | Purpose |
|------|---------|
| [package.json](package.json) | Workspace root: pnpm 11, Node 26, Biome, shared scripts |
| [pnpm-workspace.yaml](pnpm-workspace.yaml) | Workspace globs (`apps/*`, `packages/*`) |
| [tsconfig.base.json](tsconfig.base.json) | Shared TS strict config (extended by each package) |
| [biome.json](biome.json) | Linter + formatter (single-quotes, 100-char lines, `noExplicitAny`) |
| [renovate.json](renovate.json) | Automated dependency updates (minor/patch automerge, NestJS + OTel grouped) |
| [.pre-commit-config.yaml](.pre-commit-config.yaml) | pre-commit hooks: trailing whitespace, YAML/JSON check, gitleaks |

---

## Transfer notes

- [sdlc-transfer-webapp-stack.md](sdlc-transfer-webapp-stack.md) — full stack bootstrap from `stackable-specs/stacks/stack-webapp`
