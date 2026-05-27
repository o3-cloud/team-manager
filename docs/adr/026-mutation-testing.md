# ADR-026: Mutation Testing

## Status

Accepted

## Context and Problem Statement

A passing test suite only tells you that the tests did not fail; it does not tell you the tests would catch a regression. Line and branch coverage tell you which code was executed; they do not tell you whether the assertions on that code actually check anything meaningful. Mutation testing closes that gap by introducing small syntactic changes to source (flip `+` to `-`, change `<` to `<=`, drop a `return`) and re-running the tests. A mutant that survives reveals a test-assertion hole where a real bug would slip through unnoticed. The discipline only pays off when scores are gated in CI and surviving mutants are investigated rather than bulk-suppressed.

## Decision Drivers

- Assertion quality: mutation testing is the only automated mechanism that verifies tests would actually catch regressions
- Coverage gap detection: survived mutants pinpoint exactly where tests execute code but fail to assert on its behavior
- Complementarity: mutation testing works alongside coverage metrics ([ADR-030](030-test-coverage.md)) and property-based testing ([ADR-029](029-property-based-testing.md))
- Scoping: pure logic modules are the primary target; I/O-heavy modules produce too much infrastructure noise

## Considered Options

- Mutation testing with Stryker (JS/TS) or the language-appropriate framework, with per-module score thresholds gated in CI
- Coverage-only gating (line and branch coverage, no mutation testing)
- Manual code review as the sole mechanism for verifying assertion quality
- No explicit test-quality gating beyond "tests pass"

## Decision Outcome

We will use mutation testing as a CI gate for pure-logic modules. The language-appropriate framework (Stryker for JS/TS) is used; rolling custom mutation logic is forbidden. Incremental mutation testing runs on changed code in PR CI. Full-suite mutation testing runs on a scheduled cadence (nightly or weekly). A minimum mutation score per module (70–80% for new code) is set in committed configuration; builds fail when the changed-file score drops below the threshold. Every survived mutant is investigated: either a killing test is written, the mutator is suppressed with a reason, or it is recorded as equivalent or infeasible. Bulk suppression without reasons is forbidden. Previous mutation runs are cached so unchanged code is not re-mutated.

## Consequences

- Positive: mutation score is a measurable property of test-assertion quality, not a gut feeling
- Positive: survived mutants pinpoint exactly where to add targeted assertions
- Negative: mutation testing is computationally expensive; incremental runs and caching are required to keep CI fast
- Negative: investigating every survived mutant takes time; teams must commit to the discipline
- Neutral: treating mutation-test failures as advisory warnings (not blocking) is forbidden under this decision
