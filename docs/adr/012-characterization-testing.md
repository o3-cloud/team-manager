# ADR-012: Characterization Testing

## Status

Accepted

## Context and Problem Statement

When refactoring legacy code whose intended behavior is unknown, undocumented, or contested, the team needs a technique for establishing a safety net before changing the implementation. Without characterization tests, any refactor of legacy code is unverified. Without guardrails on the technique, characterization tests become permanent regression assets that lock in bugs, accumulate alongside intentional tests with no way to tell them apart, or get rubber-stamp regenerated when they fail — defeating their purpose. We need a disciplined approach that treats characterization tests as transitional scaffolding with an explicit retirement path.

## Decision Drivers

- Safety: legacy code must have a behavioral snapshot before refactoring
- Integrity: characterization tests must be clearly distinguishable from intentional spec-tests
- Hygiene: captured artifacts must be scrubbed of secrets and PII; known bugs must not be frozen in
- Retirement discipline: every characterization test must be replaced by intentional tests once the behavior is understood

## Considered Options

- Characterization testing with approval frameworks (ApprovalTests, Jest snapshots) under strict tagging and retirement rules
- Snapshot testing without explicit tagging or retirement tracking
- No formal technique — rely on developers' intuition when refactoring legacy code
- Full rewrite without a safety net

## Decision Outcome

We will use characterization testing only against existing code whose intended behavior is unknown, undocumented, or contested. Every characterization test carries a stated purpose comment and a tag distinguishing it from intentional tests (e.g. `[characterization]` in describe blocks). Approval/golden-master frameworks produce versioned `received`/`approved` artifact pairs committed to version control. CI divergence requires a human decision — auto-update is forbidden. Known bugs are not approved. Every characterization test has an explicit retirement path: it is replaced by intentional unit/integration/property tests as behavior is understood. The count of open characterization tests is tracked as a quality metric trending downward.

## Consequences

- Positive: enables safe refactoring of legacy code that would otherwise be untouchable
- Positive: approval framework makes behavioral divergence immediately visible
- Negative: characterization tests can become permanent if retirement discipline is not enforced
- Negative: approval artifacts must be scrubbed of secrets, PII, and non-deterministic output — adding setup cost
- Neutral: characterization tests are forbidden for new code; forbidden to maintain alongside intentional tests that supersede them
