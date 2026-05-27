# ADR-032: Trunk Code Quality

## Status

Accepted

## Context and Problem Statement

Multi-language repositories accumulate a different config format, installed version, and invocation style for every linter, formatter, and scanner — so "lint the repo" resolves differently on each machine, in each CI job, and between every contributor. The team needs a unified linting surface that runs the same tool versions everywhere, covers every language present, and produces a single `trunk check` gate that is both a local pre-push hook and a CI build-failure condition. Note: this ADR applies when Trunk Code Quality is the chosen hook runner; [ADR-028](028-prek.md) covers the alternative.

## Decision Drivers

- Version consistency: `.trunk/trunk.yaml` pins every tool version so contributors and CI resolve identical binaries
- Language coverage: at least one linter or formatter per language present in the repository
- Secret scanning: `gitleaks` or `trufflehog` ensures every commit is scanned for credentials
- Single gate: `trunk check --ci` as the CI gate means "passed linting" is the same statement everywhere

## Considered Options

- Trunk Code Quality with `.trunk/trunk.yaml` committed, all tools pinned, CI via `trunk check --ci`
- prek ([ADR-028](028-prek.md)) — alternative single-runner choice; select one per repository
- Per-language CI steps (each runs its own tool separately, no unified surface)
- No unified linting (each contributor uses whatever is installed locally)

## Decision Outcome

We will use Trunk Code Quality as a unified linting platform for multi-language repositories where it is chosen over prek. Trunk is initialized with `trunk init` and `.trunk/trunk.yaml` is committed. The Trunk CLI version is pinned under `cli.version`. Every enabled linter, formatter, and scanner is pinned to an explicit `<name>@<version>`. At least one linter or formatter is enabled per language present. A secret-detection scanner (`gitleaks` or `trufflehog`) is enabled. `markdownlint` and `yamllint` cover documentation and config files. Trunk git hooks are installed via `trunk git-hooks install` with `pre-push` running `trunk check`. `trunk check --ci` runs on every PR and any finding is a build failure. Auto-fix in CI is forbidden (`--fix` is local-only). Versions are upgraded via `trunk upgrade` on a documented cadence. `--no-verify` bypasses are forbidden.

## Consequences

- Positive: single committed config makes "lint the repo" identical on every machine and CI agent
- Positive: `trunk upgrade` provides a managed, auditable upgrade path for all pinned tool versions
- Negative: Trunk adds a non-npm launcher dependency to contributor setup
- Negative: `.trunk/trunk.yaml` version pinning requires deliberate maintenance as tools release new versions
- Neutral: ad-hoc `git commit --no-verify` and per-contributor tool version choices are forbidden; only one hook runner (prek or Trunk) is active per repository
