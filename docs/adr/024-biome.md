# ADR-024: Biome

## Status

Accepted

## Context and Problem Statement

JavaScript/TypeScript projects historically require separate tools for linting (ESLint), formatting (Prettier), and import sorting — each with its own config file, version, and CI gate. This produces config drift, competing formatters fighting over quote style, incompatible lint rules, and three caches to invalidate. Biome is a single Rust-implemented binary that lints, formats, and organizes imports for JS, TS, JSX, TSX, JSON, JSONC, and CSS. The wins only land when the team commits fully: running Biome alongside ESLint or Prettier reintroduces every drift Biome exists to remove.

## Decision Drivers

- Consolidation: one tool, one config file, one CI gate eliminates cross-tool config drift
- Speed: Rust implementation is significantly faster than Node.js-based ESLint + Prettier for the same files
- Consistency: a single `biome check` passing means the same thing on every machine and on CI
- Migration path: `biome migrate eslint` and `biome migrate prettier` automate the transition from the old stack

## Considered Options

- Biome as the sole linter, formatter, and import organizer
- ESLint + Prettier + eslint-plugin-import (existing stack, more mature ecosystem)
- oxlint (linter only, still requires Prettier for formatting)
- dprint (formatter only, still requires ESLint for linting)

## Decision Outcome

We will use Biome as the single linter, formatter, and import organizer for all JavaScript, TypeScript, JSX, TSX, JSON, JSONC, and CSS files in the repository. The `@biomejs/biome` version is pinned exactly as a `devDependency`. Configuration lives in `biome.json` at the repository root with `$schema` pinned to the matching version. The `recommended` rule preset is enabled. Biome's formatter replaces Prettier for all covered file types. Biome's linter replaces ESLint for all covered file types. `organizeImports.enabled = true` replaces any import-sort plugin. `biome check` (lint + format + organize imports) is the single CI gate, treating any finding as a build failure. CI runs in check-only mode (no `--write`). Biome is invoked via the project package manager, never globally. Findings are suppressed inline with `// biome-ignore <rule>: <reason>`. Migration off ESLint and Prettier happens in a single PR per package.

## Consequences

- Positive: one config file, one CI gate, one cache — eliminates cross-tool config drift permanently
- Positive: Rust-based Biome is 10–100x faster than ESLint + Prettier on typical projects
- Negative: Biome's rule coverage is not yet 1:1 with ESLint's plugin ecosystem; some specialized rules are unavailable
- Negative: migrating existing codebases requires a dedicated PR with `biome migrate` output review
- Neutral: running ESLint or Prettier alongside Biome on overlapping file types is forbidden
