# ADR-019: Trunk-Based Development

## Status

Accepted

## Context and Problem Statement

The team needs a branching model that supports continuous integration and keeps `main` deployable at all times. Without a shared model, teams default to GitFlow-shaped patterns: long-running `develop` or `staging` branches that drift from `main`, week-long feature branches that hit merge hell on day five, release branches that accumulate fixes never back-ported, and a broken trunk that nobody fixes because the next person can stack on top. Each of these breaks the property trunk-based development exists to preserve: that `main` is shippable right now, by anyone, without a multi-day integration phase.

## Decision Drivers

- Continuous integration: daily integration to trunk minimizes merge conflicts and drift
- Always-deployable trunk: every commit on `main` passes full CI and is deployable without further integration work
- Feature flag discipline: incomplete work lands behind flags rather than on side branches, eliminating long-lived branch risk
- Stop-the-line culture: a broken trunk build is the team's top priority, preventing accumulation of broken states

## Considered Options

- Trunk-based development: single `main` branch, daily integration, short-lived branches (< 2 days), feature flags for incomplete work
- GitFlow: `main`, `develop`, `release/*`, `feature/*`, `hotfix/*` branches
- GitHub Flow: `main` plus feature branches (no `develop`), no feature flags
- Ship-it branching: merge whenever ready, no CI gate

## Decision Outcome

We will use trunk-based development with a single long-lived `main` branch. Every developer integrates to trunk at least once per working day. Feature branches are short-lived (target under 1 day, hard cap 2–3 days), single-author, and single-purpose. Incomplete user-visible work is hidden behind feature flags with an owner and expected removal date. Merges are squash-merged with Conventional Commits ([ADR-013](013-conventional-commits.md)). Releases are cut from trunk. Hotfixes land on trunk first, then are cherry-picked to release branches. A broken trunk build stops further merges until fixed or reverted. Branch protection requires passing CI and at least one approving review. Force-pushes and history rewrites to trunk are forbidden. PRs target under ~400 lines of diff.

## Consequences

- Positive: `main` is always deployable; any commit can be released without an integration phase
- Positive: small, short-lived PRs are faster to review and produce smaller, more focused diffs
- Positive: daily integration eliminates multi-day merge conflicts
- Negative: feature flags add implementation overhead and require disciplined cleanup
- Negative: the stop-the-line response to a broken trunk requires cultural commitment
- Neutral: long-lived `develop`, `staging`, or `integration` branches are forbidden under this model
