# ADR-033: Unit Testing

## Status

Accepted

## Context and Problem Statement

Unit tests are the cheapest, fastest place to catch a regression and the only test tier developers run on every save — so when the suite is slow, flaky, order-dependent, or asserts on internal call counts, developers stop running it and the safety net evaporates. Without constraints, "unit tests" degrade into integration tests in disguise (real database, real clock, real network), implementation-detail mocks that re-break on every refactor, or coverage-chasing assertion-free invocations that satisfy a percentage threshold while testing nothing. We need a framework choice, test layout convention, the Arrange/Act/Assert shape, isolation requirements, and CI gate so a passing unit suite is a real signal.

## Decision Drivers

- Speed: in-memory substitutes for external collaborators keep the suite fast enough for on-save runs (target: ≤60 seconds for a typical service)
- Isolation: each test sets up the state it depends on and tears down what it produces; no test depends on another's side effects
- Behavioral focus: assertions on observable behavior (return values, exceptions, persisted state) not internal implementation details
- FIRST principles: tests are Fast, Isolated, Repeatable, Self-validating, and Timely

## Considered Options

- Dedicated unit-testing framework (vitest/jest/`bun:test` for JS/TS) with AAA structure, behavioral assertions, DI-injected fakes, and CI gating
- Integration-test-style unit tests that hit real databases and network
- No formal unit-test convention; each developer writes tests their own way
- Snapshot-only testing (characterization testing — see [ADR-012](012-characterization-testing.md) for the specific case)

## Decision Outcome

We will use a dedicated unit-testing framework (vitest, jest, or `bun:test` for JS/TS projects). Tests live under a single project-wide convention directory or alongside source as `*_test.<ext>` files. Each test is named after the behavior under test in a readable sentence form. Tests follow Arrange/Act/Assert structure with a single invocation of the unit under test. Assertions cover observable behavior, not internal implementation details. Each test covers one behavior. Tests are independent of execution order. Tests are isolated from real time, real network, real filesystem, and real databases — the clock is injected; fakes and stubs are used for external collaborators. Fakes (working in-memory implementations) are preferred over mocks (interaction-pattern assertions). The full unit suite runs as a required CI status check on every PR. Every quarantined or skipped test cites a tracking issue. Every bug fix is preceded by a failing test. `process.env.NODE_ENV === 'test'` branches in production code are forbidden.

## Consequences

- Positive: fast, isolated tests run on save and provide immediate feedback during TDD cycles ([ADR-018](018-tdd.md))
- Positive: behavioral assertions survive refactors; implementation-detail assertions do not
- Positive: tests as living documentation make behavioral intent readable without running the code
- Negative: in-memory fakes must be built and maintained; they can drift from real implementations over time
- Negative: naming tests after behavior (rather than functions) requires more thought upfront
- Neutral: real databases, real network, and real clocks in unit tests are forbidden; those belong in integration tests ([ADR-025](025-integration-testing.md))
