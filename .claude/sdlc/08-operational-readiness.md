# Context Pack 08 — Operational Readiness

> Layers 2–3 (Organization / Platform). Production-quality software needs visibility.

## Operational defaults

- Emit structured logs for meaningful state transitions and failure paths.
- Include request correlation IDs (LoggingInterceptor wired globally).
- Add OTel spans/metrics for latency-sensitive or high-traffic paths.
- Alert only on user-impacting or SLO-threatening conditions.
- Update runbooks for new operational failure modes.

## Observability checklist for a change

- [ ] What should be logged (and what must NOT be — see `07-security-privacy.md`).
- [ ] What OTel metrics/spans should be emitted.
- [ ] What alerts are needed (thresholds, severity, routing).
- [ ] What failures operators need to diagnose.
- [ ] What OpenObserve dashboard changes are needed.
- [ ] What runbook updates are needed.

## Observability stack

- **Backend:** OpenTelemetry SDK (`src/tracing.ts`) → OTLP → OpenObserve.
- **Frontend:** `@openobserve/browser-logs` + RUM (`src/telemetry.ts`); reads `VITE_OO_*` env vars.
- **Health:** `GET /api/health` — terminus + DB ping. Validate `body.status === 'ok'`, not just HTTP 200.

---

## Learned patterns

### NestJS `@nestjs/throttler` — in-memory store resets on pod restart

Throttle state is lost on pod restart (`kubectl rollout restart deployment/backend -n team-manager`).
In multi-replica deployments each replica has an independent bucket — users can bypass single-pod limits.
For production multi-pod: configure Redis store. Document in-memory resets in runbook as an operational
tool for clearing test-induced exhaustion.

### Postgres 18 — StatefulSet volume mount path

Mount path must be `/var/lib/postgresql` (parent directory), NOT `/var/lib/postgresql/data`.
Using the subdirectory causes `chown` error at startup → CrashLoopBackOff.

**Recovery (fresh dev env only — destroys data):**
```bash
kubectl scale deployment/backend -n team-manager --replicas=0
kubectl delete statefulset postgres -n team-manager
kubectl delete pvc data-postgres-0 -n team-manager
# Fix manifest, then:
kubectl apply -f k8s/postgres-statefulset.yaml
```

### Skaffold — dev vs runner profile separation

Default build target must always be `runner` (nginx, port 8080). Never use `target: dev` as default
(Vite binds 5173; nginx binds 8080 — port mismatch only surfaces at connection time).

```yaml
# Default: production runner
artifacts:
  - image: team-manager-frontend
    docker:
      target: runner

profiles:
  - name: dev
    build:
      artifacts:
        - image: team-manager-frontend
          docker:
            target: dev
```

When nginx runs as `USER nginx` (UID 101, non-root): use `listen 8080`; update container port,
readiness probe port, and Service `targetPort` to 8080.

### OpenObserve credentials drift — verify before every deployment

The k8s `OPENOBSERVE_*` secrets (in `k8s/secrets.yaml`) can drift from the credentials the running OpenObserve instance was seeded with, particularly after cluster rebuilds, namespace teardown/recreate, or OO pod restarts that reinitialize the instance.

**Symptom:** OO API returns "Unauthorized Access" to all queries; traces and metrics appear not to be received; simulation observability step produces no data.

**Pre-deployment check (add to every gate 7 checklist):**

```bash
# Verify OO credentials match the running instance
kubectl get secret team-manager-secrets -n team-manager -o jsonpath='{.data.OPENOBSERVE_PASSWORD}' | base64 -d
# Then: curl -u <OPENOBSERVE_USER>:<decoded-password> http://localhost:5080/api/default/streams
# Must return JSON, not "Unauthorized Access"
```

If credentials are mismatched, either:
1. Update `k8s/secrets.yaml` with the credentials the running OO instance was initialized with, then `kubectl apply -f k8s/secrets.yaml && kubectl rollout restart deployment/backend -n team-manager`
2. Or delete and re-create the OO pod so it reinitializes to the credentials in the secret

> Added: bdr-ui-sprint, 2026-05-28. OO API auth failed throughout gate 8 — no observability signals available during production simulation.

### Events require an active season — integration tests and smoke tests must create a season first

The `POST /teams/:teamId/events` endpoint requires an **active season** for the team. If no season exists (or no season is in `ACTIVE` state), the API returns `422 "No active season"`.

This is a domain constraint (BDR-013 Season management) that is enforced at the service layer, not just at the UI level. It affects:
- Integration tests that create events — `beforeAll` must first `POST /teams/:teamId/seasons` and confirm it is `ACTIVE`
- Gate 8 smoke tests — event creation steps must be preceded by a season creation step
- Coaching flows in the UI — if no active season exists, the Create Event form should warn the coach

**Pattern for integration test setup:**

```ts
beforeAll(async () => {
  // 1. create team
  const teamRes = await request(app).post('/teams').send({ name: 'Test Team' });
  teamId = teamRes.body.id;

  // 2. create and activate season BEFORE creating any events
  const seasonRes = await request(app)
    .post(`/teams/${teamId}/seasons`)
    .send({ name: 'Spring 2026', startDate: '2026-01-01', endDate: '2026-12-31' });
  seasonId = seasonRes.body.id;
  // Season is ACTIVE on creation if startDate <= today <= endDate
  // If not, PATCH to activate it: /teams/:teamId/seasons/:seasonId/activate

  // 3. now safe to create events
});
```

> Added: bdr-ui-sprint, 2026-05-28. Gate 8 validation initially failed on event creation with 422 "No active season" until a season was created first. This constraint was not obvious from BDR-005 (Event scheduling) documentation.

### k8s health probe path

**CORRECTION (bdr-ui-sprint, 2026-05-28):** The prior note on this topic was wrong.

The NestJS Terminus health controller is mounted **outside** the global prefix. The backend health endpoint is `/health`, not `/api/health`. K8s liveness and readiness probes that target the backend pod directly must use `/health`:

```yaml
readinessProbe:
  httpGet:
    path: /health    # NOT /api/health — NestJS has no global prefix on the health controller
    port: 3000
```

`/api/health` is only reachable via the nginx or Vite proxy (which strips `/api`). Probes and port-forward smoke tests bypass the proxy and must use the bare `/health` path.

See also the matching note in `02-engineering-standards.md` (bdr-ui-sprint section).
