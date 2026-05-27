# ADR-035: Renovate

## Status

Accepted

## Context and Problem Statement

The dependency management policy ([ADR-034](034-dependency-management.md)) requires keeping dependencies current on a recurring schedule. Without automation, humans must remember to refresh dependencies — which they do not reliably do. Renovate operationalizes the policy: it watches lockfiles, opens pull requests as new versions are published, integrates vulnerability feeds, and keeps the dependency graph current. Mis-configured, it becomes the loudest source of churn in the repo: unbatched PRs for every transitive bump every hour, `automerge: true` landing a malicious patch before any human sees it, unpinned `extends:` presets shifting behavior, and vulnerability alerts arriving on the same SLA as routine bumps.

## Decision Drivers

- Policy operationalization: Renovate is the machine that runs the dependency management policy automatically
- Noise control: PR concurrency limits, scheduled batching, and ecosystem grouping keep Renovate PRs manageable
- Security prioritization: security updates are separate, always-on, unbatched with high priority
- Config-as-code: all Renovate configuration is committed to the repo and validated in CI

## Considered Options

- Renovate (config-as-code, highly configurable, vulnerability feed integration, self-hostable or cloud)
- Dependabot (GitHub-native, less configurable, no lockfile maintenance, no batch grouping)
- Manual dependency refreshes on a calendar schedule
- No automated dependency updates

## Decision Outcome

We will use Renovate for automated dependency updates across all repositories. A `renovate.json` (or equivalent) is committed at the repository root as the single source of truth. The config includes a `$schema` reference and is validated in CI with `renovate-config-validator`. All preset references are pinned to a tag or commit. An explicit `timezone` and `schedule` for routine PRs excludes outside-of-hours and weekends. `prConcurrentLimit` and `prHourlyLimit` cap noise. The dependency dashboard is enabled. Routine non-security updates are batched by ecosystem (weekly). Security updates are a separate, unbatched, always-on stream via `vulnerabilityAlerts` with no schedule and high `prPriority`. `rangeStrategy` is set explicitly per ecosystem. `lockFileMaintenance` runs on a documented schedule. `automerge` is restricted to patch and pin updates of dev-only dependencies, lockfile maintenance, and explicitly allowlisted packages — security updates and major bumps are never automerged. Renovate's runner version is pinned when self-hosting.

## Consequences

- Positive: the dependency graph stays current without human memory; security patches surface automatically
- Positive: batched routine PRs and PR limits prevent Renovate from overwhelming the review queue
- Positive: config-as-code means Renovate behavior is reviewable, version-controlled, and reproducible
- Negative: initial configuration investment is significant; getting grouping, scheduling, and automerge policies right takes iteration
- Negative: Renovate PRs still require CI to pass; a failing test in an updated dependency blocks its merge
- Neutral: repo-wide `automerge: true` across all ecosystems and update types, and Dependabot as a parallel updater, are forbidden
