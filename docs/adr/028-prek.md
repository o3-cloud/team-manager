# ADR-028: prek (Git Hook Runner)

## Status

Accepted

## Context and Problem Statement

The team needs a git hook runner to enforce quality gates locally before code reaches CI. Hook repos pinned to `rev: main` silently absorb whatever the upstream pushed (a supply-chain vector). Hooks installed locally but never run in CI create "works for me, fails on main" loops. `git commit --no-verify` converts the gate into theatre. Without a secret scanner hook, credentials end up in `git log`. Multiple competing hook frameworks (prek next to husky next to trunk) duplicate work and confuse contributors. We need a single, committed hook runner with pinned hook versions, a baseline hook set, and a CI mirror.

## Decision Drivers

- Supply-chain safety: every remote hook repo is pinned to a tagged release or commit SHA, never a branch
- CI parity: the same prek configuration runs in CI as a build failure, not just locally
- Secret scanning: every commit is scanned for credentials as a baseline requirement
- Single runner: one hook framework per repository eliminates competing hook installations

## Considered Options

- prek (Rust-implemented, pre-commit-compatible config format, drop-in replacement)
- pre-commit (upstream Python-based hook runner)
- Trunk Code Quality git hooks ([ADR-032](032-trunk-code-quality.md)) — pick one
- Husky with Lefthook (Node.js-native, no remote hook pinning)

## Decision Outcome

We will use prek as the git hook runner for all repositories. Configuration lives in a single `prek.toml` (or `.pre-commit-config.yaml`) at the repository root. The prek CLI version is pinned per project. Every remote repo entry's `rev:` is pinned to a tagged release or commit SHA. `prek install` is documented in the onboarding step. At minimum: one formatter/linter hook per language, a secret-detection hook (gitleaks or equivalent), and baseline file-hygiene hooks (`trailing-whitespace`, `end-of-file-fixer`, `check-yaml`, `check-json`, `check-merge-conflict`, `check-added-large-files`). CI mirrors the same prek configuration as a blocking build step. `git commit --no-verify` is forbidden. Exactly one hook runner per repository — prek is chosen; Husky and Lefthook are removed.

## Consequences

- Positive: pinned remote hook `rev:` entries prevent supply-chain attacks via compromised hook repos
- Positive: CI mirror of prek configuration ensures local and CI gates are identical
- Positive: secret scanning as a baseline hook prevents credential commits from reaching `git log`
- Negative: prek adds a non-Node toolchain dependency (Rust binary) to contributor setup
- Negative: hook environment builds on first `prek run` can be slow; CI caching is required
- Neutral: `--no-verify` bypasses and multiple competing hook runners are forbidden
