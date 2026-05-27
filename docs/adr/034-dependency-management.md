# ADR-034: Dependency Management

## Status

Accepted

## Context and Problem Statement

Every third-party dependency is code the team ships but did not write, run by the same process with the same privileges as first-party code. Without discipline, a floating version range pulls in a malicious patch release overnight, a missing lockfile means CI and production resolve different graphs, an unpinned base image rebases onto a vulnerable layer, a `git` or URL dependency points at a branch that can be force-pushed, and a long-abandoned transitive dependency sits four levels deep with no maintainer for a CVE. We need to pin where dependencies may come from, how versions are declared and locked, how new dependencies are reviewed, and how stale or risky ones are retired.

## Decision Drivers

- Reproducibility: lockfile + frozen builds ensure identical dependency graphs across all environments
- Supply-chain security: registry allowlisting, SLSA provenance, integrity hashes, and no `git`/URL dependencies in production manifests
- Review discipline: new direct dependencies require human review of ownership, maintenance signal, and license
- Currency: automated tooling (Renovate via [ADR-035](035-renovate.md)) keeps dependencies fresh without human memory

## Considered Options

- Explicit version pinning, committed lockfiles, frozen CI installs, allowlisted registries, automated updates via Renovate
- Floating version ranges with periodic manual updates
- Vendoring all dependencies (no external registry dependency at build time)
- No explicit dependency policy

## Decision Outcome

We will enforce the following dependency management policy across all projects. Every direct dependency is declared in a committed manifest file. A lockfile is committed for every project that produces a deployable artifact. CI and production builds use frozen-install flags that prohibit lockfile mutation. Direct dependencies are pinned to an exact version or a narrow documented range (no `*`, `latest`, or `>=X`). Dependencies are resolved only from a documented allowlisted set of registries. `git`, URL, file, and tarball dependencies are forbidden in production manifests. Container base images are pinned by content digest. Integrity hashes are recorded for every locked dependency. New direct dependencies require review (owner, maintenance signal, license, transitive footprint). Dependency changes require a designated reviewer. Automated dependency updates use Renovate ([ADR-035](035-renovate.md)). Security updates are standalone PRs with SLA from the vulnerability-scanning policy ([ADR-037](037-vulnerability-scanning.md)). The license allowlist is enforced in CI. Unused dependencies are identified and removed periodically.

## Consequences

- Positive: frozen lockfile builds eliminate dependency-graph drift between developer machines, CI, and production
- Positive: registry allowlisting prevents dependency-confusion attacks and unauthorized package sources
- Positive: review requirement for new direct dependencies reduces typosquat and malicious-package risk
- Negative: exact pinning and allowlisted registries require Renovate automation to stay current without excessive manual overhead
- Negative: maintaining a license allowlist requires an initial policy decision and ongoing updates as new dependencies are added
- Neutral: `*`, `latest`, and `>=X` version ranges and `git`/URL dependencies in production manifests are forbidden
