# ADR-013: Conventional Commits

## Status

Accepted

## Context and Problem Statement

The team needs a commit message format that enables automated release notes, SemVer version bumping, changelog generation, and monorepo task graphs. Without a machine-parseable format, every downstream tool — release bots, changelog renderers, scope-filtered CI — requires a human to re-read diffs. Adopted halfway, the format produces noise: `Fixed bug` lands next to `feat: add auth`, breaking changes ship as `chore`, and the changelog says "0 user-facing changes" the day a major shipped. The discipline is only valuable when every commit on the default branch parses and when CI enforces the format so violations cannot land.

## Decision Drivers

- Automation: release-please, semantic-release, and git-cliff generate correct release notes only when the commit log is machine-parseable
- SemVer integrity: `feat:` triggers minor bumps, `fix:` triggers patch bumps, `!` and `BREAKING CHANGE:` trigger major bumps
- Traceability: scoped commits enable filtering CI by changed subsystems; `git bisect` can distinguish refactors from behavior changes
- Enforcement: commitlint in CI and as a `commit-msg` hook makes violations blocking, not advisory

## Considered Options

- Conventional Commits 1.0.0 with commitlint enforcement in CI and as a local commit-msg hook
- Freeform commit messages with no machine-parseable structure
- GitHub squash-merge with PR title as the commit message (no local enforcement)
- Angular commit message convention (superseded by Conventional Commits)

## Decision Outcome

We will use Conventional Commits 1.0.0 as the sole commit message format. Every commit on the default branch conforms to `<type>[scope][!]: <description>`. The type vocabulary is fixed (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`). Breaking changes always carry `!` and a `BREAKING CHANGE:` footer. Subject lines are ≤72 characters, imperative mood, no trailing period. commitlint runs in CI against every PR commit and as a local `commit-msg` hook. Release notes and changelogs are generated automatically from the commit log; no hand-edited `CHANGELOG.md`.

## Consequences

- Positive: automated release tools produce correct SemVer bumps and changelogs from commit history
- Positive: scope-filtered CI can skip unnecessary jobs when only unrelated files change
- Negative: contributors must learn the format; commitlint violations create friction for new team members
- Negative: squash-merging PRs with WIP commits requires crafting a conformant subject at merge time
- Neutral: freeform commit messages, hand-edited changelogs, and non-conformant merge commits are forbidden on `main`
