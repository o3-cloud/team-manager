# ADR-030: Test Coverage Metrics

## Status

Accepted

## Context and Problem Statement

Test coverage is easy to measure and easy to misuse. A single repo-wide percentage can be padded with assertion-free tests, diluted by counting generated code, or held flat for years while the actual at-risk surface grows. Reported well, the same metric is a real signal: line and branch coverage targeted by tier, gated on new code, scoped to first-party logic, and paired with a ground-truth check (mutation testing via [ADR-026](026-mutation-testing.md)) that confirms executed lines were actually asserted on. We need a coverage policy that makes the metric a floor on assertion presence, not a ceiling that excuses mutation, integration, or property tests from carrying their share.

## Decision Drivers

- Branch coverage: uncovered branches inside covered lines are precisely where defects hide; line coverage alone is insufficient
- New code gate: a PR passing a flat global threshold while its own changed surface is uncovered is a gap; new code needs a higher bar
- Per-module tracking: a critical module's coverage cannot be masked by a well-tested module in the global average
- Requirements coverage: every BDR ([ADR-011](011-bdr.md)) must map to at least one executable scenario

## Considered Options

- Line + branch coverage with per-tier thresholds, per-module floors, new-code differential gating, paired with mutation testing
- Global line-coverage percentage only (easy to game, not meaningful)
- No coverage measurement; rely on test quality via code review
- Test-count-based metrics (not correlated with assertion quality)

## Decision Outcome

We will measure line and branch coverage on every CI run. Explicit numeric thresholds are set per tier in committed configuration. New and changed code in a PR is held to a higher threshold than the repository aggregate (e.g. ≥90% for new code). CI blocks on any coverage drop below threshold — coverage reports are never `continue-on-error`. Per-package and per-component floors are tracked alongside the repo-wide aggregate. Coverage is measured from instrumented runs across all test tiers (unit, integration, property), merged into a single report. Only generated, vendored, third-party, and build-tooling source paths are excluded; every exclusion is documented in the coverage config. Every BDR maps to at least one executable integration test scenario. Coverage reports are published as CI artifacts in a standard format. Thresholds are reviewed and ratcheted quarterly. Assertion-free tests are forbidden.

## Consequences

- Positive: per-tier thresholds and new-code differential gating prevent high-level coverage numbers from hiding low-coverage changes
- Positive: requirements coverage linking BDRs to tests makes behavioral regressions detectable
- Negative: configuring per-tier and per-module thresholds requires upfront policy decisions
- Negative: coverage instrumentation adds measurable overhead to test suite execution time
- Neutral: configuring coverage as informational-only, excluding first-party code, and treating a global percentage as the sole quality signal are all forbidden
