# Team Manager

A sports-team coordination platform for coaches, players, and parents. Coaches build rosters, schedule events, and communicate with their teams. Players and parents confirm attendance, receive notifications, and review game history. Every capability is scoped to a team and governed by the member's role within it.

---

## Contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quickstart](#quickstart)
- [Development](#development)
- [Testing](#testing)
- [Observability](#observability)
- [CI/CD](#cicd)
- [Domain model](#domain-model)
- [Project layout](#project-layout)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser                                                     │
│  React 19 + React Router 7 + Tailwind 4 + daisyUI 5         │
│  OpenObserve RUM (session replay, logs, traces)              │
└───────────────────────────┬─────────────────────────────────┘
                            │ /api/*
┌───────────────────────────▼─────────────────────────────────┐
│  NestJS 11 (Node 26)                                         │
│  REST API · Swagger at /api/docs                             │
│  JWT auth · Role-based guards · OTel traces + metrics + logs │
└──────────┬──────────────────────────┬───────────────────────┘
           │                          │
     ┌─────▼──────┐          ┌────────▼──────────┐
     │ PostgreSQL  │          │  OpenObserve       │
     │ 18 (TypeORM)│          │  (traces, metrics, │
     └────────────┘          │   logs, RUM)       │
                             └───────────────────┘
```

The monorepo contains three packages deployed to a single Kubernetes namespace (`team-manager`):

| Package | Path | Runtime |
|---|---|---|
| Backend API | `apps/backend` | NestJS 11, Node 26 |
| Frontend SPA | `apps/frontend` | React 19, nginx 1.30 |
| UI component library | `packages/ui` | React 19 peer |

In production the frontend nginx container proxies `/api/*` to the backend service and `/rum/*` to OpenObserve, keeping the browser pointed at a single origin.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend framework | NestJS 11 |
| ORM | TypeORM 0.3 |
| Database | PostgreSQL 18 |
| Frontend framework | React 19 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 4, daisyUI 5 |
| Router | React Router 7 |
| API mocking | MSW 2 |
| Auth | JWT (passport-jwt) + bcrypt |
| Observability | OpenTelemetry 0.217 → OpenObserve 0.80 |
| Package manager | pnpm 11 |
| Runtime | Node 26 |
| Linter / formatter | Biome 2 |
| Unit tests (backend) | Jest 29, Supertest |
| Unit tests (frontend) | Vitest 4, Testing Library |
| Integration tests | Testcontainers (real Postgres) |
| E2E tests | Playwright 1.59 (Chromium) |
| Container orchestration | Docker Compose (dev), Kubernetes + Skaffold (prod) |
| Secret scanning | gitleaks |
| Vulnerability scanning | Trivy |

---

## Prerequisites

| Tool | Minimum version | Install |
|---|---|---|
| Node.js | 26 | [nodejs.org](https://nodejs.org) |
| pnpm | 11 | `npm i -g pnpm@11` |
| Docker Desktop | latest | [docker.com](https://www.docker.com/products/docker-desktop) |
| Kubernetes (Docker Desktop) | any | Enable in Docker Desktop → Settings → Kubernetes |
| Skaffold | 2 | [skaffold.dev/docs/install](https://skaffold.dev/docs/install/) |

Run the pre-flight check to confirm everything is in place:

```sh
make doctor
```

---

## Quickstart

```sh
# 1. Install dependencies
pnpm install

# 2. Generate k8s/secrets.yaml with cryptographically-random values
make secrets

# 3. Start the full stack in the cluster with hot-reload
make dev
```

`make dev` runs `skaffold dev`, which builds Docker images locally, applies all manifests to the `team-manager` namespace on Docker Desktop, and port-forwards:

| Service | Local address |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api/docs |
| OpenObserve | http://localhost:15080 (docker compose only) |

> The Swagger UI at `/api/docs` is the fastest way to explore and call the REST API without a client.

---

## Development

### Docker Compose (lightweight alternative)

If you don't need the full Kubernetes environment, Docker Compose provides a faster loop:

```sh
docker compose up --watch
```

This starts Postgres 18, OpenObserve, and both app containers with `compose watch` file-sync. The backend API is at `http://localhost:3001` and the frontend at `http://localhost:5174`.

### Local (no containers)

```sh
pnpm install

# Start both apps in parallel with hot-reload
pnpm dev
```

The Vite dev server proxies `/api/*` to `http://localhost:3000` by default. Set `BACKEND_URL` to override.

### Environment variables

All required env vars are read from the Kubernetes ConfigMaps and Secrets (`k8s/*.yaml`). For local development outside the cluster, create `apps/backend/.env` and `apps/frontend/.env.local`:

**`apps/backend/.env`**
```
DATABASE_URL=postgres://team-manager:password@localhost:5432/team-manager
JWT_SECRET=dev-secret
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:15080/api/default
```

**`apps/frontend/.env.local`**
```
VITE_OO_CLIENT_TOKEN=<your-openobserve-rum-token>
VITE_OO_SITE=localhost:15080
VITE_OO_INSECURE_HTTP=true
```

### Code quality

```sh
# Lint and format check
pnpm check

# Auto-fix
pnpm check:write

# Type check all packages
pnpm typecheck
```

Biome enforces single quotes, 100-character lines, no explicit `any`, and no `dangerouslySetInnerHtml`. Pre-commit hooks run Biome, YAML/JSON validation, large-file checks, and gitleaks on every commit.

---

## Testing

### Unit and integration

```sh
# All unit tests (Jest + Vitest)
pnpm test

# Backend integration tests — spins up a real Postgres via Testcontainers
pnpm --filter @team-manager/backend test:integration

# Frontend with coverage (80% threshold enforced)
pnpm --filter @team-manager/frontend test:coverage
```

### End-to-end

E2E tests require the stack to be running (either `make dev` or `docker compose up`):

```sh
make test-e2e
```

Playwright runs against Chromium and uses `BASE_URL=http://localhost:5173` by default.

---

## Observability

The platform ships full-stack observability out of the box:

| Signal | Source | Destination |
|---|---|---|
| Traces | OTel Node SDK (auto-instrumented HTTP, Express, pg) | OpenObserve via OTLP/HTTP |
| Metrics | OTel PeriodicExportingMetricReader (30 s interval) | OpenObserve via OTLP/HTTP |
| Logs | OTel BatchLogRecordProcessor | OpenObserve via OTLP/HTTP |
| RUM | OpenObserve browser-rum SDK | OpenObserve via nginx `/rum/` proxy |
| Session replay | openobserveRum.startSessionReplayRecording() (100% sample rate) | OpenObserve |
| Browser logs | OpenObserve browser-logs SDK (forwards JS errors) | OpenObserve |

The backend emits traces, metrics, and logs before the NestJS process starts (`import './tracing'` is the first line of `main.ts`). The frontend initialises RUM before React mounts (`import './telemetry'` is the first import in `main.tsx`).

In the Kubernetes environment, telemetry routes through an OTel Collector gateway in the `openobserve-collector` namespace. In Docker Compose, it goes directly to the bundled OpenObserve container on port 15080.

---

## CI/CD

GitHub Actions runs the full pipeline on every push to `main` and on pull requests:

| Stage | Timeout | What runs |
|---|---|---|
| Lint & format | 10 min | `biome check` |
| Type check | 10 min | `tsc --noEmit` across all packages |
| Unit tests | 15 min | Jest (backend), Vitest (frontend) with coverage |
| Integration tests | 30 min | Testcontainers against a real Postgres instance |
| Build backend | 20 min | Docker build with GHA layer cache |
| Build frontend | 20 min | Docker build with GHA layer cache |
| Vulnerability scan | 15 min | Trivy on the backend image (CRITICAL + HIGH) |
| SBOM | 10 min | Anchore SBOM in SPDX format |
| Playwright E2E | 30 min | Full stack via docker compose, Chromium |

All action versions are pinned. Renovate keeps minor and patch dependencies up to date with automerge, and groups NestJS and OpenTelemetry packages into single PRs.

---

## Domain model

Team Manager is modelled using Domain-Driven Design. The bounded contexts and their relationships are documented in [`docs/domain/`](docs/domain/).

### Bounded contexts

| Context | Type | Responsibility |
|---|---|---|
| **Identity** | Generic | User accounts and authentication |
| **Team** | Core | Members, roles, roster, seasons |
| **Schedule** | Core | Events (game, practice, meeting), recurrence, cancellation |
| **Participation** | Core | RSVP commitments and post-event attendance records |
| **Results** | Supporting | Game scores and season win/loss records |
| **Communication** | Supporting | Coach announcements and in-app notifications |

### Key aggregates

`User` · `Team` · `Membership` · `Invite` · `Event` · `RecurringEventSeries` · `Season` · `RSVP` · `AttendanceRecord` · `GameResult` · `Announcement`

### Roles

`COACH` · `ASSISTANT_COACH` · `TEAM_MANAGER` · `SCOREKEEPER` · `PLAYER` · `PARENT`

### Domain events

`EventCreated` · `EventUpdated` · `EventCancelled` · `EventReinstated` · `InviteAccepted` · `GameResultRecorded` · `AnnouncementPosted`

The full ubiquitous language is in [`docs/domain/ubiquitous-language.md`](docs/domain/ubiquitous-language.md). Behaviour-driven requirements (15 BDRs) are in [`docs/bdr/`](docs/bdr/).

---

## Project layout

```
team-manager/
├── apps/
│   ├── backend/          # NestJS 11 API
│   │   ├── src/
│   │   │   ├── auth/     # JWT register/login, JwtStrategy, JwtAuthGuard
│   │   │   ├── users/    # UsersService + UserEntity
│   │   │   ├── health/   # /health endpoint (terminus + DB ping)
│   │   │   ├── common/   # RolesGuard, Roles decorator, filters, interceptors
│   │   │   └── tracing.ts # OTel SDK init (must be first import)
│   │   └── Dockerfile
│   └── frontend/         # React 19 SPA
│       ├── src/
│       │   ├── telemetry.ts # OO RUM + logs init (must be first import)
│       │   └── mocks/handlers.ts # MSW handlers (empty — add here)
│       ├── e2e/          # Playwright tests
│       ├── nginx.conf    # Production nginx: SPA fallback, API proxy, RUM proxy
│       └── Dockerfile
├── packages/
│   └── ui/               # Shared component library (Button, Card)
├── k8s/                  # Kubernetes manifests
│   ├── secrets.example.yaml # Copy of → k8s/secrets.yaml (gitignored)
│   └── *.yaml
├── docs/
│   ├── domain/           # DDD context map, aggregates, policies, ADRs
│   └── bdr/              # Behaviour-driven requirements (15 BDRs)
├── docker-compose.yml    # Local dev: Postgres, OpenObserve, backend, frontend
├── skaffold.yaml         # Kubernetes dev loop
├── Makefile              # Operator surface: make dev / test / clean / doctor
├── biome.json            # Linter + formatter
└── .github/workflows/ci.yml
```

---

## Useful commands

```sh
make help            # Show all Makefile targets with descriptions
make doctor          # Verify prerequisites
make secrets         # Generate k8s/secrets.yaml (run once, gitignored)
make dev             # Start full Kubernetes dev loop
make build           # Build Docker images locally
make test            # Run unit + integration tests
make test-e2e        # Run Playwright E2E (requires running stack)
make clean           # Tear down namespace, PVCs, and generated secrets
```
