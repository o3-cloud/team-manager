# ADR-025: Integration Testing

## Status

Accepted

## Context and Problem Statement

Unit tests verify that a function does what its author intended in isolation; they cannot catch schema drift, broken migrations, contract mismatches between services, transaction isolation issues, broker reconnection edge cases, or the full set of real-world failure modes. A test that stitches together mocks instead of real dependencies is a unit test in disguise regardless of the directory it lives in. We need a discipline that defines what an integration test must use as dependencies, how state is isolated between runs, and how it gates merges — so the integration suite is a load-bearing safety net rather than a slow, flaky CI job people learn to ignore.

## Decision Drivers

- Realism: integration tests must use real out-of-process dependencies (same image, same migrations, same configuration as production)
- Isolation: each test must start from a clean state; shared mutable state across tests produces non-deterministic failures
- Reliability: flaky integration tests are treated as priority-one bugs, not retried indefinitely
- Gate completeness: the full integration suite runs on every PR as a required status check

## Considered Options

- Integration tests using real dependencies via Testcontainers ([ADR-031](031-testcontainers.md)), with per-test state isolation
- Integration tests using mocked dependencies (effectively unit tests with a different label)
- Integration tests against a shared development or staging environment
- No integration tests; rely on unit tests and end-to-end tests only

## Decision Outcome

We will require integration tests for every test that exercises the system against a real out-of-process collaborator. Real dependencies are provisioned via Testcontainers or an equivalent ephemeral-container framework — never shared dev/staging environments. The same container image and the same migrations as production are used for any integration-tested datastore. State is isolated per test (transactional rollback, fresh schema, or fresh container). Third-party HTTP APIs outside the team's control are the only things mocked at the outer boundary. Determinism is enforced (pinned clocks, seeded randomness, no external DNS). Integration tests live under a separate directory and are tagged so unit-test commands exclude them. The full suite is a required CI status check on every PR. Flaky tests are quarantined and filed as priority-one bugs.

## Consequences

- Positive: real dependencies catch schema drift, migration failures, and contract mismatches that mocked tests cannot detect
- Positive: production-identical containers eliminate "passes in CI, fails in prod" failures caused by environment differences
- Negative: real containers increase CI run time compared to mock-only suites
- Negative: provisioning infrastructure (Docker on CI) is a prerequisite
- Neutral: mocking the system-under-test's own adjacent components (its DB, broker, in-process modules) is forbidden
