# Context Pack 09 — Release Governance

> Layers 2–3 (Organization / Platform). Shipping is part of quality.

## Release defaults

- Prefer feature flags for user-facing behavior changes.
- Maintain backward compatibility across deployments.
- Separate schema expansion from schema contraction (add column → deploy → drop old column).
- Define rollback before deployment.
- Validate production behavior after release (`GET /api/health`, smoke test key flows).
- Monitor errors, latency, and adoption after rollout via OpenObserve.

## Rollout

Environment → k8s namespace → percentage. Define abort thresholds before starting.
Use `skaffold run` for one-shot deploys; `skaffold dev` for iterative dev.

## Database migrations

- TypeORM migration files live in `apps/backend/src/migrations/`.
- Schema changes follow expand/contract pattern for zero-downtime deployments.
- Always test migration forward and rollback on a local copy before deploying.

## Rollback

- Reverting the k8s deployment image tag is the fastest rollback.
- Do not drop columns or tables as an emergency rollback.
- In-memory throttle state clears on pod restart — useful as operational reset, not a data-rollback tool.
- Document the rollback path before deploying.

## Approval

Production deployment always requires explicit human approval.
Security-sensitive changes (auth, PII, new external integrations) require escalation.

## Production environment

The local Kubernetes cluster (Docker Desktop, namespace `team-manager`) **is** the
production environment for this project. There is no separate cloud prod cluster.

**Rules for every release plan:**
- "Deploy to production" = `skaffold run -n team-manager` or `kubectl apply` against
  the local Docker Desktop k8s context. Not a remote environment.
- Gate 8 (Production Validation) validates against this cluster directly via
  port-forwarded or LoadBalancer endpoints.
- Pre-deployment checks must verify cluster reachability: `kubectl get ns team-manager`.
- `make secrets` generates `k8s/secrets.yaml` with live credentials for this cluster.
- Release plans must reference namespace `team-manager` on the Docker Desktop context.
