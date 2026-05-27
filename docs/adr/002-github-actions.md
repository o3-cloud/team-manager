# ADR-002: GitHub Actions

## Status

Accepted

## Context and Problem Statement

GitHub Actions is the CI/CD substrate that decides what code reaches main, what artifacts get published, and what credentials a workflow may exercise. A sloppy workflow is simultaneously a supply-chain risk, a secret-leak risk, and a cost liability: unpinned third-party actions invite tag-rewrite attacks, default `GITHUB_TOKEN` write permissions enlarge the blast radius of a compromised step, missing concurrency controls let a slower deploy clobber a newer one, missing timeouts burn minutes on stuck jobs, and `pull_request_target` workflows can hand secrets to forks. We need a consistent, secure convention for all workflows in the repository.

## Decision Drivers

- Supply-chain integrity: third-party action pinning by full commit SHA prevents tag-rewrite attacks
- Least privilege: explicit `permissions:` blocks prevent accidental credential escalation
- Secret hygiene: OIDC over long-lived secrets; no echoing of secrets into logs
- Operational reliability: concurrency groups, explicit timeouts, and environment-gated deployments

## Considered Options

- GitHub Actions with security-hardened conventions (SHA pinning, explicit permissions, OIDC, concurrency, environment gates)
- GitHub Actions with default/ad-hoc configuration (floating action tags, default permissions, long-lived secrets)
- External CI platforms (CircleCI, Jenkins, GitLab CI, Buildkite)

## Decision Outcome

We will use GitHub Actions as the sole CI/CD platform. Every workflow lives under `.github/workflows/`, every third-party action is pinned to a 40-character commit SHA (GitHub-owned actions to a major-version tag at minimum), every job declares explicit `permissions:` starting from `contents: read`, every deploy-race workflow declares a `concurrency:` group, every job sets `timeout-minutes:`, production deploys require a GitHub `environment:` with required reviewers, cloud credentials use OIDC instead of long-lived secrets, and untrusted PR input is passed through `env:` variables rather than directly interpolated into shell scripts.

## Consequences

- Positive: SHA-pinned actions eliminate tag-rewrite supply-chain attacks; least-privilege permissions bound breach impact
- Positive: OIDC eliminates long-lived cloud credentials from repository secrets
- Positive: environment-gated deployments require explicit approval before production releases
- Negative: SHA pinning adds maintenance overhead; Renovate ([ADR-035](035-renovate.md)) automates keeping SHAs current
- Negative: explicit `permissions:` blocks require initial authoring effort per workflow
- Neutral: developers can no longer shortcut CI by omitting security declarations
