# Context Pack 08 — Operational Readiness

> Layers 2–3 (Organization / Platform). Reusable across production systems.
> Production-quality software needs visibility.

## Operational defaults

- Emit structured logs for meaningful state transitions and failure paths.
- Include correlation IDs in service-to-service flows.
- Add metrics for success, failure, latency, retry, and queue depth where relevant.
- Alert only on user-impacting or SLO-threatening conditions.
- Update runbooks for new operational failure modes.

## Observability checklist for a change

- [ ] What should be logged (and what must NOT be — see `07-security-privacy.md`)
- [ ] What metrics should be emitted
- [ ] What alerts are needed, with thresholds, severity, and routing
- [ ] What failures operators need to diagnose
- [ ] What dashboard changes are needed
- [ ] What runbook updates are needed

## Operational readiness

- SLO / SLA impact assessed.
- Capacity impact assessed.
- On-call ownership clear.
- Incident severity model understood.

---

## Learned patterns

### NestJS `@nestjs/throttler` — in-memory store resets on pod restart

`ThrottlerModule.forRoot` defaults to an in-memory store. This means:
- Throttle state is **lost on pod restart** — useful for clearing test-induced exhaustion
  (`kubectl rollout restart deployment/<backend> -n <ns>`).
- In multi-replica deployments, each replica has an **independent throttle bucket** —
  a user can bypass a 5-req limit by hitting 5 different replicas.

For production multi-pod deployments, configure a Redis store:
```typescript
ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (cfg: ConfigService) => ({
    throttlers: [{ ttl: 900_000, limit: 5 }],
    storage: new ThrottlerStorageRedisService(cfg.get('REDIS_URL')),
  }),
  inject: [ConfigService],
})
```

Document single-pod in-memory throttle resets in the runbook — they are an operational
tool for clearing test-induced exhaustion, not a bug.

> Added: todo-ux-bugfixes run, 2026-05-26.

---

### Postgres 18 — StatefulSet volume mount path

Postgres 18 changed its `PGDATA` default. The correct `mountPath` in a k8s StatefulSet
is `/var/lib/postgresql` (the **parent** directory), not `/var/lib/postgresql/data`.

```yaml
# Correct (Postgres 18+)
volumeMounts:
  - name: data
    mountPath: /var/lib/postgresql

# Wrong — causes CrashLoopBackOff at startup
volumeMounts:
  - name: data
    mountPath: /var/lib/postgresql/data
```

Using the subdirectory path causes a `chown` error at container start → CrashLoopBackOff.

**Recovery procedure:**
```bash
kubectl scale deployment/backend -n <ns> --replicas=0   # stop writers first
kubectl delete statefulset postgres -n <ns>
kubectl delete pvc data-postgres-0 -n <ns>              # DESTROYS DATA — only on fresh env
# Fix manifest, then:
kubectl apply -f k8s/postgres-statefulset.yaml
```

> Added: team-core run, 2026-05-27. Deployment defect D-1.

---

### Skaffold — dev vs runner profile separation

Frontend Dockerfiles with a `dev` stage (Vite / webpack dev server) and a `runner`
stage (nginx serving static assets) require separate Skaffold profiles.

**Rule:** the default build target must always be `runner` (matches CI and production).
Using `target: dev` as the Skaffold default causes a port mismatch at deployment time
(Vite binds 5173; nginx binds 8080), which only surfaces when you try to connect.

```yaml
# skaffold.yaml — default builds the production runner
artifacts:
  - image: team-manager-frontend
    docker:
      dockerfile: apps/frontend/Dockerfile
      target: runner        # ← always the production nginx image

profiles:
  - name: dev               # use: skaffold dev --profile dev
    build:
      artifacts:
        - image: team-manager-frontend
          docker:
            target: dev     # ← Vite dev server, hot-reload
```

Also: when the nginx runner uses `USER nginx` (non-root, UID 101), the listen port must
be ≥ 1024. Use `listen 8080` in `nginx.conf` and update the container port, readiness
probe port, and Service `targetPort` to 8080 accordingly.

> Added: team-core run, 2026-05-27. Deployment defect at gate 8.

---

### OpenObserve `doc_num=0` — WAL-flush artifact, not a pipeline failure

The OpenObserve streams API (`/api/<org>/streams`) reports `doc_num` as the **on-disk committed count** after a WAL flush — it is not a real-time ingestion counter. Immediately after deployment or pod restart, `doc_num` can read `0` for minutes even when data is actively flowing.

**Reliable OTel pipeline diagnostic — use the OO access log instead:**
```bash
kubectl logs deployment/openobserve -n <ns> | grep "POST /api/<org>/v1/"
# Healthy: HTTP 200 on /v1/traces, /v1/metrics, /v1/logs
# Problem: HTTP 4xx/5xx or missing lines entirely
```

Also add a startup `console.log` to the OTel init to confirm SDK startup and endpoint URL:
```typescript
sdk.start();
console.log(`OpenTelemetry SDK started — exporting to ${otlpBase}`);
```
This gives an immediate human-readable signal in `kubectl logs` without querying OO.

**Anti-pattern:** using `doc_num > 0` as the acceptance criterion for OTel pipeline health. WAL flush timing is non-deterministic; `doc_num=0` is a false alarm. Use HTTP 200 on OTLP POST endpoints as the authoritative signal.

> Added: otel-k8s-hardening run, 2026-05-27.

---

### TypeORM / Postgres — transient DNS `ENOTFOUND` on k8s pod startup is normal

When a Postgres StatefulSet pod is restarted (e.g., after a securityContext patch), the backend pod may log:

```
Error: getaddrinfo ENOTFOUND postgres
```

This is expected k8s behavior: the backend container starts before CoreDNS has fully propagated the `postgres` service endpoint to the pod's DNS resolver. TypeORM retries the connection and succeeds within 1–3 seconds. Pod reaches `1/1 Running` with 0 restarts.

**Operator note:** this error during a rollout is NOT a crash or a misconfiguration. Do not rollback on this error alone. Confirm recovery by checking `kubectl get pods -n <ns>` (Running + 0 restarts) and `GET /api/health` returning `{"database":{"status":"up"}}`.

> Added: otel-k8s-hardening run, 2026-05-27.
