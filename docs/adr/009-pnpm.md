# ADR-009: pnpm

## Status

Accepted

## Context and Problem Statement

Given the decision to use npm as the package registry standard ([ADR-008](008-npm.md)), the team needs to select a specific package manager CLI. pnpm stores each dependency version once in a content-addressable global store and links it into projects via hard links, preventing phantom dependency access through a non-flat `node_modules` layout. Without shared conventions, teams re-enable flat hoisting with `shamefully-hoist`, mix pnpm with npm or yarn commands, omit the `packageManager` field so contributors use mismatched versions, and manage monorepo dependencies with `file:` references instead of the `workspace:` protocol.

## Decision Drivers

- Phantom dependency prevention: non-flat `node_modules` enforces that packages can only import what they declare
- Disk efficiency: content-addressable store deduplicates packages across projects on the same machine
- Monorepo support: native `pnpm-workspace.yaml` and `workspace:` protocol eliminate `file:` path references
- Reproducibility: `packageManager` field pins the pnpm version used across all contributors and CI

## Considered Options

- pnpm with content-addressable store, non-flat layout, and `workspace:` protocol
- npm workspaces (flat `node_modules`, no phantom-dependency prevention)
- Yarn Berry (PnP mode, different compatibility trade-offs)
- Bun (faster installs, less mature ecosystem support at decision time)

## Decision Outcome

We will use pnpm as the package manager. The exact pnpm version is declared in the root `package.json` `packageManager` field. `shamefully-hoist=true` is forbidden. Monorepo packages are declared in `pnpm-workspace.yaml`. Intra-workspace references use the `workspace:` protocol. Local binaries are invoked via `pnpm exec`. Commands are scoped with `pnpm --filter`. A single `pnpm-lock.yaml` at the root covers all packages (`shared-workspace-lockfile=true`). `pnpm store prune` is run periodically in CI cache maintenance. `npm install` and `yarn install` commands are forbidden in pnpm-managed projects.

## Consequences

- Positive: non-flat `node_modules` catches phantom dependencies that would silently work in npm but break in production
- Positive: single global content-addressable store reduces CI disk usage significantly in monorepos
- Positive: `packageManager` field ensures every contributor uses the same pnpm version
- Negative: non-flat layout occasionally breaks packages that assume flat `node_modules`; requires `shamefully-hoist` exceptions with documentation
- Neutral: `npx` for local binaries is replaced by `pnpm exec`
