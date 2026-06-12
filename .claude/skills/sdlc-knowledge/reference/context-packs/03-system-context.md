# Context Pack 03 — System Context

> Layer 4 (System). Reusable within one repo / service / product.

## System purpose

Team Manager is a sports-team management platform. Coaches create teams, schedule events,
and manage rosters. Players/Parents accept invites to join teams, RSVP to events, and view
schedules. The backend exposes a REST API; the frontend is a React SPA served via nginx.

## Architecture overview

```
Browser (React 19 / Vite)
  ↓ /api/* proxy
nginx (frontend k8s pod)
  ↓
NestJS 11 backend (apps/backend)  ← JWT-authenticated REST API
  ↓
PostgreSQL 18 (k8s StatefulSet)   ← TypeORM 0.3, migrationsRun: true
  ↓ OTLP (traces/metrics/logs)
OpenObserve (k8s Deployment)      ← observability (currently not receiving data)
```

Monorepo: `apps/backend`, `apps/frontend`, `packages/ui`. pnpm workspaces.
Deployed to local Kubernetes (Docker Desktop), namespace `team-manager`. This is the
production environment — there is no separate prod cluster.

## Data stores

| Store | Contents |
|---|---|
| PostgreSQL `team-manager` DB | users, teams, memberships, invites, events, rsvps, seasons, game_results, announcements |
| `invites.token_hash` | SHA-256 of raw invite token (hex); raw token never persisted |

## APIs & integration points

- REST API base: `http://backend.team-manager.svc.cluster.local:3000` (k8s internal)
- Port-forwarded for local dev/testing: `kubectl port-forward svc/backend 3000:3000 -n team-manager`
- Swagger docs: `GET /api/docs` (unconditionally exposed — pre-existing issue)
- Health: `GET /health` — returns DB ping status
- Auth: `POST /auth/register`, `POST /auth/login` → returns `{ accessToken, user }`
- OTLP endpoint: `http://openobserve.team-manager.svc.cluster.local:5080/api/default`

## Authentication & authorization model

- JWT (HS256), signed with `JWT_SECRET` from k8s secret. Token expiry: 7 days.
- `JwtAuthGuard` applied globally; public routes use `@Public()` decorator.
- `RolesGuard` enforces team roles (COACH, PLAYER, PARENT) on specific endpoints.
- Team access: `findOne` existence check (404) before membership check (403).
- **Known gap:** `TeamMemberGuard` on sub-routes (`/teams/:id/invites`, etc.) still returns 403 for non-existent team IDs — guard doesn't inject TeamRepo.

## Known constraints & invariants

- `synchronize: false` — all schema changes require explicit TypeORM migrations.
- `migrationsRun: true` — migrations run automatically on pod startup before accepting traffic.
- Old and new backend images cannot run simultaneously if a migration drops/renames a column (cut-over only).
- Invite tokens are bearer credentials — the raw token MUST NOT be stored or returned after the creation response.
- Team UUID params must be validated with `ParseUUIDPipe` before hitting the service layer (missing on several routes — pre-existing).

## Known technical debt

| ID | Description | Introduced | Priority |
|---|---|---|---|
| TD-1 | `TeamMemberGuard` still returns 403 for non-existent team on sub-routes | team-core run | Medium |
| TD-2 | JWT secret fallback in `configuration.ts:8` AND `jwt.strategy.ts:18` | pre-existing | High |
| TD-3 | `actions/download-artifact@v4` CVE GHSA-cxww-7g56-2vh6 in CI | pre-existing | Medium |
| TD-4 | `protobufjs@8.0.1` 7 CVEs via `@nestjs/terminus → @grpc/grpc-js` | pre-existing | Medium |
| TD-5 | Swagger UI unconditionally exposed (no NODE_ENV guard) | pre-existing | Medium |
| TD-6 | OTel pipeline not delivering traces/metrics/logs to OpenObserve (0 docs) | pre-existing | Medium |
| TD-7 | `ParseUUIDPipe` missing on teams/invites/events route params → 500 on malformed UUID | discovered api-contract-fixes gate 8 | High |
| TD-8 | Password complexity: only `@MinLength(8)` on `RegisterDto` (no uppercase/digit/special) | pre-existing | Low |
| TD-9 | Redis throttler not configured; login endpoint has only global rate limiting | F-8 backlog | Low |

## Ownership

- Owning developer: Owen Zanzal (ozanzal@gmail.com)
- Production: local k8s (Docker Desktop), namespace `team-manager`
- CI: GitHub Actions (`.github/workflows/ci.yml`)

> Updated: api-contract-fixes run, 2026-05-27.
